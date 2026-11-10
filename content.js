(() => {
  "use strict";

  function setSpamFilter(on) {
    document.documentElement.dataset.kickSpamFilter = on ? "be" : "ki";
  }

  setSpamFilter(true);

  chrome.storage.local.get("on").then(({ on = true }) => {
    setSpamFilter(on);
  });

  chrome.storage.onChanged.addListener((state, storage) => {
    if (storage !== "local" || !("on" in state)) return;

    setSpamFilter(state.on.newValue !== false);
  });
})();
