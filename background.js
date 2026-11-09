function setBadge(on) {
  chrome.action.setBadgeText({ text: on ? "BE" : "KI" });
  chrome.action.setBadgeBackgroundColor({ color: on ? "#53fc18" : "#666666" });
}

async function init() {
  const { on = true } = await chrome.storage.local.get("on");
  await chrome.storage.local.set({ on });
  setBadge(on);
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

chrome.action.onClicked.addListener(async () => {
  const { on = true } = await chrome.storage.local.get("on");
  const newState = !on;

  await chrome.storage.local.set({ on: newState });
  setBadge(newState);
});