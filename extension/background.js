// Open Side Panel on icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_AGGREGATION") {
    aggregateJobData().then(data => sendResponse({ data }));
    return true; // Keep channel open for async response
  }
});

async function aggregateJobData() {
  // Query all open tabs
  const tabs = await chrome.tabs.query({ currentWindow: true });
  
  const aggregationPromises = tabs.map(async (tab) => {
    try {
      // Inject content script to extract text
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText // Simple scraper
      });
      return { url: tab.url, content: result };
    } catch (e) {
      return null; // Skip tabs where script injection is blocked (e.g. chrome://)
    }
  });

  return (await Promise.all(aggregationPromises)).filter(t => t !== null);
}