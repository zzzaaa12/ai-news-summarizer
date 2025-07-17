// 背景腳本
chrome.runtime.onInstalled.addListener(() => {
  console.log('新聞摘要助手已安裝');
});

// 處理來自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSummary') {
    // 這裡可以添加額外的邏輯
    sendResponse({success: true});
  }
});

// 監聽標籤頁更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 檢查是否為新聞網站
    const newsPatterns = [
      /news\.com/,
      /cnn\.com/,
      /bbc\.com/,
      /reuters\.com/,
      /ap\.org/,
      /udn\.com/,
      /chinatimes\.com/,
      /ltn\.com\.tw/,
      /ettoday\.net/,
      /tvbs\.com\.tw/
    ];
    
    const isNewssite = newsPatterns.some(pattern => pattern.test(tab.url));
    
    if (isNewssite) {
      console.log('檢測到新聞網站:', tab.url);
    }
  }
});