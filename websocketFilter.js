(() => {
  "use strict";

  const spamWindowSize = 10;

  const emoteOnlyPattern = /^\s*(?:\[emote:\d+:[^\]]+\]\s*)+$/;
  const emotePattern = /\[emote:\d+:([^\]]+)\]/g;

  const xdStreakKey = "${username}:__xd__";

  const spamStreaks = new Map();
  const filteredEventCache = new WeakMap();
  const wrappedListeners = new WeakMap();
  const originalOnMessage = new WeakMap();

  let messagePosition = 0;

  function isFilterEnabled() {
    return document.documentElement.dataset.kickSpamFilter !== "off";
  }

  function isXdSpam(content) {
    const xdCount = (content.match(/[xd]/gi) || []).length;
    const letterCount = (content.match(/\p{L}/gu) || []).length;
    return letterCount >= 2 && xdCount / letterCount > 0.8;
  }

  function getEmoteName(content) {
    if (!emoteOnlyPattern.test(content)) return null;

    const emoteNames = [...content.matchAll(emotePattern)].map((match) => match[1]);
    const allSameEmote = emoteNames.every((name) => name === emoteNames[0]);

    return allSameEmote ? emoteNames[0] : null;
  }

  function tryParseJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }

  function findChatMessages(value, found = [], depth = 0) {
    if (depth > 8 || value === null) return found;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        const parsed = tryParseJson(trimmed);
        if (parsed !== undefined) findChatMessages(parsed, found, depth + 1);
      }
      return found;
    }

    if (typeof value !== "object") return found;

    const username = value.sender?.username;
    if (typeof value.content === "string" && typeof username === "string") {
      found.push({ username, content: value.content });
      return found;
    }

    for (const child of Object.values(value)) {
      findChatMessages(child, found, depth + 1);
    }

    return found;
  }

  function forgetOldStreaks() {
    for (const [key, position] of spamStreaks) {
      if (messagePosition - position > spamWindowSize) spamStreaks.delete(key);
    }
  }

  function isSpamMessage({ username, content }) {
    messagePosition++;
    forgetOldStreaks();

 
    if (!emoteOnlyPattern.test(content) && isXdSpam(content)) {
      const isSpam = spamStreaks.has(xdStreakKey);
      spamStreaks.set(xdStreakKey, messagePosition);
      return isSpam;
    }

    const emoteName = getEmoteName(content);
    const streakKey = emoteName && `${username}:${emoteName}`;

    
    const userPrefix = `${username}:`;
    for (const key of spamStreaks.keys()) {
      if (key.startsWith(userPrefix) && key !== streakKey) spamStreaks.delete(key);
    }

    if (!emoteName) return false;

    const isSpam = spamStreaks.has(streakKey);
    spamStreaks.set(streakKey, messagePosition);

    return isSpam;
  }

  function filterFrame(rawData) {
    if (typeof rawData !== "string") return rawData;
    if (!isFilterEnabled()) return rawData;

    const lines = rawData.split("\n");
    let changed = false;

    const keptLines = lines.filter((line) => {
      if (!line.trim()) return true;

      const parsed = tryParseJson(line);
      if (parsed === undefined) return true;

      const messages = findChatMessages(parsed);
      if (messages.length !== 1) return true;

      const drop = isSpamMessage(messages[0]);
      if (drop) changed = true;
      return !drop;
    });

    if (!changed) return rawData;

    const remaining = keptLines.filter((line) => line.trim());
    return remaining.length ? keptLines.join("\n") : null;
  }

  function getFilteredEvent(event) {
    if (filteredEventCache.has(event)) return filteredEventCache.get(event);

    const filteredData = filterFrame(event.data);
    let result;

    if (filteredData === event.data)
      result = event;
    else if (filteredData === null)
      result = null;
    else
      result = new MessageEvent("message", {
        data: filteredData,
        origin: event.origin,
        lastEventId: event.lastEventId,
      });

    filteredEventCache.set(event, result);
    return result;
  }

  function wrapListener(listener) {
    const isCallable = typeof listener === "function";
    const isHandlerObject = typeof listener?.handleEvent === "function";
    if (!isCallable && !isHandlerObject) return listener;

    if (wrappedListeners.has(listener)) return wrappedListeners.get(listener);

    const wrapped = function (event) {
      const filteredEvent = getFilteredEvent(event);
      if (!filteredEvent) return;

      return isCallable
        ? listener.call(this, filteredEvent)
        : listener.handleEvent(filteredEvent);
    };

    wrappedListeners.set(listener, wrapped);
    return wrapped;
  }

  function findProperty(object, propertyName) {
    while (object) {
      const descriptor = Object.getOwnPropertyDescriptor(object, propertyName);
      if (descriptor) return descriptor;
      object = Object.getPrototypeOf(object);
    }
    return null;
  }

  const socketPrototype = window.WebSocket.prototype;
  const addEventListener = socketPrototype.addEventListener;
  const removeEventListener = socketPrototype.removeEventListener;
  const onMessage = findProperty(socketPrototype, "onmessage");

  socketPrototype.addEventListener = function (type, listener, options) {
    if (type === "message")
      listener = wrapListener(listener);

    return addEventListener.call(this, type, listener, options);
  };

  socketPrototype.removeEventListener = function (type, listener, options) {
    if (type === "message" && wrappedListeners.has(listener))
      listener = wrappedListeners.get(listener);

    return removeEventListener.call(this, type, listener, options);
  };

  if (onMessage?.set) {
    Object.defineProperty(socketPrototype, "onmessage", {
      configurable: true,
      enumerable: true,
      get() {
        return originalOnMessage.get(this) ?? null;
      },
      set(handler) {
        originalOnMessage.set(this, handler);
        onMessage.set.call(this, typeof handler === "function" ? wrapListener(handler) : handler);
      },
    });
  }
})();