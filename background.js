chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ tabGroups: {} });
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveTabGroup") {
      chrome.storage.local.get("tabGroups", (data) => {
        const groups = data.tabGroups || {};
        groups[message.folderName] = message.tabs;
        chrome.storage.local.set({ tabGroups: groups });
      });
    } else if (message.action === "getTabGroups") {
      chrome.storage.local.get("tabGroups", (data) => {
        sendResponse(data.tabGroups || {});
      });
      return true;
    } else if (message.action === "openTabGroup") {
      const urls = message.tabs;
      urls.forEach((url) => {
        chrome.tabs.create({ url });
      });
    }
  });
  