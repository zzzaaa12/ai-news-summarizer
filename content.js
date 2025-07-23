// 新聞摘要內容腳本
class NewsSummarizer {
  constructor() {
    this.overlay = null;
    this.summaryModal = null;
    this.isProcessing = false;
  }

  // 初始化
  async init() {
    console.log('新聞摘要助手初始化中...', window.location.href);

    // 檢查是否為 UDN 首頁
    if (this.isUdnHomePage()) {
      console.log('檢測到 UDN 首頁，初始化新聞列表功能');
      await this.initUdnHomePage();
      return;
    }

    // 檢查是否為新聞頁面
    const isNews = this.isNewsPage();
    console.log('是否為新聞頁面:', isNews);

    if (isNews) {
      console.log('檢測到新聞頁面，開始初始化功能');
      await this.createSummaryButton();
      await this.autoSummarize();
    } else {
      console.log('未檢測到新聞頁面，跳過初始化');
      // 輸出頁面中存在的元素供調試
      this.debugPageElements();
    }
  }

  // 判斷是否為新聞頁面
  isNewsPage() {
    const newsIndicators = [
      'article', '.article', '#article',
      '.news-content', '.story-content',
      '[role="article"]', '.post-content',
      '.text', '.text-content', '.article-text',
      '.content-text', '.main-content', '.article-body',
      '.news-text', '.story-text', '.article-detail',
      '.boxTitle', '.whitecon', '.cont'
    ];

    return newsIndicators.some(selector =>
      document.querySelector(selector) !== null
    );
  }

  // 提取新聞內容
  extractNewsContent() {
    const selectors = [
      'article p',
      '.article-content p',
      '.news-content p',
      '.story-content p',
      '.post-content p',
      '.content p',
      '.text p',
      '.text-content p',
      '.article-text p',
      '.main-content p',
      '.article-body p',
      '.whitecon p',
      '.cont p',
      '.boxTitle + div p',
      '.article-detail p'
    ];

    let content = '';

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        content = Array.from(elements)
          .map(p => p.textContent.trim())
          .filter(text => text.length > 20)
          .join('\n');
        break;
      }
    }

    // 如果沒找到，嘗試獲取所有段落
    if (!content) {
      const allParagraphs = document.querySelectorAll('p');
      content = Array.from(allParagraphs)
        .map(p => p.textContent.trim())
        .filter(text => text.length > 20)
        .slice(0, 10)
        .join('\n');
    }

    return content.substring(0, 3000); // 限制長度
  }

  // 獲取新聞標題
  getNewsTitle() {
    const titleSelectors = [
      'h1',
      '.article-title',
      '.news-title',
      '.story-title',
      'title'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return document.title;
  }

  // 生成摘要（支援多個AI服務）
  async generateSummary(content, title) {
    try {
      const settings = await this.getSettings();

      if (settings.aiService === 'gemini') {
        return await this.generateGeminiSummary(content, title, settings);
      } else if (settings.aiService === 'xai') {
        return await this.generateXAISummary(content, title, settings);
      } else if (settings.aiService === 'cloudflare') {
        return await this.generateCloudflareSummary(content, title, settings);
      } else {
        return await this.generateOpenAISummary(content, title, settings);
      }
    } catch (error) {
      console.error('生成摘要時發生錯誤:', error);
      throw error;
    }
  }

  // 調用OpenAI API生成摘要
  async generateOpenAISummary(content, title, settings) {
    if (!settings.openaiApiKey) {
      throw new Error('請先在擴展設定中配置OpenAI API密鑰');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openaiApiKey}`
      },
      body: JSON.stringify({
        model: settings.openaiModel,
        messages: [
          {
            role: 'system',
            content: '你是一個專業的新聞摘要助手。請用繁體中文為新聞內容生成條列式的摘要(從數字1開始)，最多500中文字，包含所有要點。'
          },
          {
            role: 'user',
            content: `請為以下新聞生成摘要：\n標題：${title}\n內容：${content}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API請求失敗: ${response.status} - ${errorData.error?.message || '未知錯誤'}`);
    }

    const data = await response.json();

    // 確保有獲得摘要內容
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('OpenAI API回應格式錯誤或未獲得摘要內容');
    }

    const summary = data.choices[0].message.content.trim();

    // 檢查摘要是否為空或過短
    if (!summary || summary.length < 10) {
      throw new Error('生成的摘要內容過短或為空');
    }

    return summary;
  }

  // 調用Gemini API生成摘要
  async generateGeminiSummary(content, title, settings) {
    if (!settings.geminiApiKey) {
      throw new Error('請先在擴展設定中配置Gemini API密鑰');
    }

    const prompt = `你是一個專業的新聞摘要助手。請用繁體中文為新聞內容生成條列式的摘要(從數字1開始)，最多500中文字，包含所有要點。

標題：${title}
內容：${content}

請生成摘要：`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel}:generateContent?key=${settings.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API請求失敗: ${response.status} - ${errorData.error?.message || '未知錯誤'}`);
    }

    const data = await response.json();

    // 確保有獲得摘要內容
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Gemini API回應格式錯誤或未獲得摘要內容');
    }

    const summary = data.candidates[0].content.parts[0].text.trim();

    // 檢查摘要是否為空或過短
    if (!summary || summary.length < 10) {
      throw new Error('生成的摘要內容過短或為空');
    }

    return summary;
  }

  // 調用xAI API生成摘要
  async generateXAISummary(content, title, settings) {
    if (!settings.xaiApiKey) {
      throw new Error('請先在擴展設定中配置xAI API密鑰');
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.xaiApiKey}`
      },
      body: JSON.stringify({
        model: settings.xaiModel,
        messages: [
          {
            role: 'system',
            content: '你是一個專業的新聞摘要助手。請用繁體中文為新聞內容生成條列式的摘要(從數字1開始)，最多500中文字，包含所有要點。'
          },
          {
            role: 'user',
            content: `請為以下新聞生成摘要：\n標題：${title}\n內容：${content}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`xAI API請求失敗: ${response.status} - ${errorData.error?.message || '未知錯誤'}`);
    }

    const data = await response.json();

    // 確保有獲得摘要內容
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('xAI API回應格式錯誤或未獲得摘要內容');
    }

    const summary = data.choices[0].message.content.trim();

    // 檢查摘要是否為空或過短
    if (!summary || summary.length < 10) {
      throw new Error('生成的摘要內容過短或為空');
    }

    return summary;
  }

  // 調用Cloudflare Workers AI生成摘要
  async generateCloudflareSummary(content, title, settings) {
    if (!settings.cloudflareApiKey) {
      throw new Error('請先在擴展設定中配置Cloudflare API Token');
    }

    if (!settings.cloudflareAccountId) {
      throw new Error('請先在擴展設定中配置Cloudflare Account ID');
    }

    const prompt = `你是一個專業的新聞摘要助手。請用繁體中文為新聞內容生成條列式的摘要(從數字1開始)，最多500中文字，包含所有要點。

標題：${title}
內容：${content}

請生成摘要：`;

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${settings.cloudflareAccountId}/ai/run/${settings.cloudflareModel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.cloudflareApiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是一個專業的新聞摘要助手。請用繁體中文為新聞內容生成條列式的摘要(從數字1開始)，最多500中文字，包含所有要點。'
          },
          {
            role: 'user',
            content: `請為以下新聞生成摘要：\n標題：${title}\n內容：${content}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Cloudflare Workers AI請求失敗: ${response.status} - ${errorData.error?.message || '未知錯誤'}`);
    }

    const data = await response.json();

    // 確保有獲得摘要內容
    if (!data.success || !data.result || !data.result.response) {
      throw new Error('Cloudflare Workers AI回應格式錯誤或未獲得摘要內容');
    }

    const summary = data.result.response.trim();

    // 檢查摘要是否為空或過短
    if (!summary || summary.length < 10) {
      throw new Error('生成的摘要內容過短或為空');
    }

    return summary;
  }

  // 獲取設定
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'aiService',
        'openaiApiKey',
        'geminiApiKey',
        'xaiApiKey',
        'cloudflareApiKey',
        'cloudflareAccountId',
        'openaiModel',
        'geminiModel',
        'xaiModel',
        'cloudflareModel'
      ], (result) => {
        resolve({
          aiService: result.aiService || 'gemini',
          openaiApiKey: result.openaiApiKey,
          geminiApiKey: result.geminiApiKey,
          xaiApiKey: result.xaiApiKey,
          cloudflareApiKey: result.cloudflareApiKey,
          cloudflareAccountId: result.cloudflareAccountId,
          openaiModel: result.openaiModel || 'gpt-4o-mini',
          geminiModel: result.geminiModel || 'gemini-2.5-flash-lite-preview-06-17',
          xaiModel: result.xaiModel || 'grok-4-0709',
          cloudflareModel: result.cloudflareModel || '@cf/meta/llama-3.1-8b-instruct'
        });
      });
    });
  }

  // 格式化摘要內容，將 Markdown 轉換為 HTML
  formatSummaryContent(summary) {
    return summary
      // 轉換粗體 **text** 為 <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 轉換斜體 *text* 為 <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 轉換換行為 <br>
      .replace(/\n/g, '<br>')
      // 保護已有的 HTML 標籤不被重複處理
      .replace(/<br><br>/g, '<br><br>');
  }

  // 創建覆蓋層和摘要模態框
  createOverlayAndModal(summary, title) {
    // 格式化摘要內容
    const formattedSummary = this.formatSummaryContent(summary);

    // 創建覆蓋層
    this.overlay = document.createElement('div');
    this.overlay.id = 'news-summary-overlay';
    this.overlay.innerHTML = `
      <div class="summary-modal">
        <div class="summary-header">
          <h3>📰 新聞摘要</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="summary-title">${title}</div>
        <div class="summary-content">${formattedSummary}</div>
        <div class="summary-footer">
          <small>由 AI 生成</small>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // 添加關閉事件
    const closeBtn = this.overlay.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.closeSummary());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeSummary();
      }
    });

    // ESC鍵關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay) {
        this.closeSummary();
      }
    });
  }

  // 關閉摘要
  closeSummary() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  // 檢查是否有API密鑰
  async hasApiKey() {
    const settings = await this.getSettings();

    if (settings.aiService === 'openai') {
      return !!settings.openaiApiKey;
    } else if (settings.aiService === 'xai') {
      return !!settings.xaiApiKey;
    } else if (settings.aiService === 'cloudflare') {
      return !!(settings.cloudflareApiKey && settings.cloudflareAccountId);
    } else {
      return !!settings.geminiApiKey;
    }
  }

  // 顯示頂部狀態條
  showTopStatusBar(message) {
    // 移除已存在的狀態條
    this.hideTopStatusBar();

    const statusBar = document.createElement('div');
    statusBar.id = 'news-summary-status-bar';
    statusBar.innerHTML = `
      <div class="status-content">
        <div class="status-spinner"></div>
        <span class="status-text">${message}</span>
      </div>
    `;

    document.body.appendChild(statusBar);
  }

  // 隱藏頂部狀態條
  hideTopStatusBar() {
    const existingBar = document.getElementById('news-summary-status-bar');
    if (existingBar) {
      existingBar.remove();
    }
  }

  // 自動生成摘要
  async autoSummarize() {
    if (this.isProcessing) return;

    // 檢查是否有API密鑰，沒有就不執行
    const hasKey = await this.hasApiKey();
    if (!hasKey) {
      console.log('未設定API密鑰，跳過自動摘要');
      return;
    }

    try {
      this.isProcessing = true;

      const content = this.extractNewsContent();
      const title = this.getNewsTitle();

      if (!content || content.length < 100) {
        console.log('未找到足夠的新聞內容');
        return;
      }

      // 顯示頂部狀態條
      this.showTopStatusBar('正在產生新聞摘要...');

      const summary = await this.generateSummary(content, title);

      // 隱藏狀態條並顯示摘要
      this.hideTopStatusBar();
      this.createOverlayAndModal(summary, title);

    } catch (error) {
      this.hideTopStatusBar();
      this.showError(error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  // 顯示載入中
  showLoading() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'news-summary-overlay';
    this.overlay.innerHTML = `
      <div class="summary-modal loading">
        <div class="loading-spinner"></div>
        <p>正在生成新聞摘要...</p>
      </div>
    `;
    document.body.appendChild(this.overlay);
  }

  // 隱藏載入中
  hideLoading() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  // 顯示錯誤
  showError(message) {
    this.overlay = document.createElement('div');
    this.overlay.id = 'news-summary-overlay';
    this.overlay.innerHTML = `
      <div class="summary-modal error">
        <div class="summary-header">
          <h3>❌ 錯誤</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="error-content">${message}</div>
        <div class="summary-footer">
          <button class="retry-btn">重試</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.closeSummary());

    const retryBtn = this.overlay.querySelector('.retry-btn');
    retryBtn.addEventListener('click', () => {
      this.closeSummary();
      this.autoSummarize();
    });
  }

  // 創建摘要按鈕
  async createSummaryButton() {
    const button = document.createElement('button');
    button.id = 'news-summary-btn';
    button.innerHTML = '📰 生成摘要';
    button.addEventListener('click', () => this.autoSummarize());

    // 將按鈕添加到頁面右下角
    document.body.appendChild(button);
  }

  // 檢查是否為 UDN 首頁
  isUdnHomePage() {
    const url = window.location.href;
    // 只匹配真正的首頁 URL
    return url.includes('udn.com/news/index') ||
      (url.includes('udn.com') && url.endsWith('/')) ||
      (url.includes('udn.com') && url.match(/\/news\/?$/));
  }

  // 初始化 UDN 首頁功能
  async initUdnHomePage() {
    console.log('初始化 UDN 首頁新聞列表功能');

    // 等待頁面完全載入
    await this.waitForPageLoad();

    // 創建新聞摘要頁面按鈕
    this.createUdnSummaryButton();

    // 直接顯示摘要
    await this.generateUdnHomeSummary();

    // 監聽頁面變化（動態載入內容）
    this.observePageChanges();
  }

  // 等待頁面載入
  waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        setTimeout(resolve, 1000); // 額外等待1秒確保動態內容載入
      } else {
        window.addEventListener('load', () => {
          setTimeout(resolve, 1000);
        });
      }
    });
  }

  // 創建 UDN 摘要按鈕
  createUdnSummaryButton() {
    const button = document.createElement('button');
    button.id = 'udn-news-summary-btn';
    button.innerHTML = '📰 生成首頁摘要';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;

    button.addEventListener('click', () => this.generateUdnHomeSummary());
    button.addEventListener('mouseenter', () => {
      button.style.background = '#1d4ed8';
      button.style.transform = 'translateY(-2px)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = '#2563eb';
      button.style.transform = 'translateY(0)';
    });

    document.body.appendChild(button);
  }

  // 擷取 UDN 首頁新聞列表
  extractUdnNewsList() {
    const newsList = [];

    // 尋找新聞列表項目
    const newsItems = document.querySelectorAll('.story-list__news, .story-list, .news-list__item, .story-item');

    console.log(`找到 ${newsItems.length} 個新聞項目`);

    newsItems.forEach((item, index) => {
      try {
        // 擷取標題和連結
        const titleLink = item.querySelector('h3 a, .story-list__text h3 a, .title a, a[title]');
        const title = titleLink ? titleLink.getAttribute('title') || titleLink.textContent.trim() : '';
        const link = titleLink ? titleLink.href : '';

        // 擷取摘要文字
        const summaryElement = item.querySelector('p, .story-list__text p, .summary, .excerpt');
        const summary = summaryElement ? summaryElement.textContent.trim() : '';

        // 擷取時間
        const timeElement = item.querySelector('time, .story-list__time, .time, .date');
        const time = timeElement ? timeElement.textContent.trim() : '';

        // 擷取圖片
        const imgElement = item.querySelector('img, .story-list__image img');
        const image = imgElement ? imgElement.src : '';

        if (title && link) {
          newsList.push({
            title,
            link,
            summary,
            time,
            image,
            index: index + 1
          });
        }
      } catch (error) {
        console.error(`處理新聞項目 ${index} 時發生錯誤:`, error);
      }
    });

    // 如果沒找到，嘗試其他選擇器
    if (newsList.length === 0) {
      console.log('使用備用選擇器搜尋新聞');
      const alternativeItems = document.querySelectorAll('article, .news-item, .story, [class*="news"], [class*="story"]');

      alternativeItems.forEach((item, index) => {
        if (index >= 20) return; // 限制數量

        const titleElement = item.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
        const linkElement = item.querySelector('a[href*="/story/"], a[href*="/news/"]');

        if (titleElement && linkElement) {
          const title = titleElement.textContent.trim();
          const link = linkElement.href;

          if (title && link && title.length > 10) {
            newsList.push({
              title,
              link,
              summary: '',
              time: '',
              image: '',
              index: newsList.length + 1
            });
          }
        }
      });
    }

    console.log(`成功擷取 ${newsList.length} 則新聞`);
    return newsList.slice(0, 50); // 限制最多15則新聞
  }

  // 生成 UDN 首頁摘要
  async generateUdnHomeSummary() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;

      // 顯示載入狀態
      this.showTopStatusBar('正在擷取首頁新聞列表...');

      // 擷取新聞列表
      const newsList = this.extractUdnNewsList();

      if (newsList.length === 0) {
        throw new Error('未找到新聞列表，請確認頁面已完全載入');
      }

      // 更新狀態
      this.showTopStatusBar('正在生成新聞摘要頁面...');

      // 生成摘要頁面
      this.createUdnSummaryPage(newsList);

      this.hideTopStatusBar();

    } catch (error) {
      this.hideTopStatusBar();
      this.showError(error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  // 創建 UDN 摘要頁面
  createUdnSummaryPage(newsList) {
    // 生成新聞列表 HTML
    const newsListHtml = newsList.map(news => `
      <div class="news-item">
        <div class="news-content">
          <h4 class="news-title">
            <a href="${news.link}" target="_blank" rel="noopener">${news.title}</a>
          </h4>
          ${news.summary ? `<p class="news-summary">${news.summary}</p>` : ''}
          ${news.time ? `<div class="news-time">${news.time}</div>` : ''}
        </div>
        ${news.image ? `<div class="news-image"><img src="${news.image}" alt="" loading="lazy"></div>` : ''}
      </div>
    `).join('');

    // 創建覆蓋層
    this.overlay = document.createElement('div');
    this.overlay.id = 'udn-summary-overlay';
    this.overlay.innerHTML = `
      <div class="udn-summary-modal">
        <div class="summary-header">
          <h3>📰 UDN 首頁新聞摘要</h3>
          <div class="header-actions">
            <button class="refresh-btn" title="重新整理">🔄</button>
            <button class="close-btn">&times;</button>
          </div>
        </div>
        <div class="summary-stats">
          <span>共找到 ${newsList.length} 則新聞</span>
          <span>更新時間: ${new Date().toLocaleString('zh-TW')}</span>
        </div>
        <div class="news-list">
          ${newsListHtml}
        </div>
        <div class="summary-footer">
          <small>由新聞摘要助手自動擷取整理</small>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // 添加事件監聽
    const closeBtn = this.overlay.querySelector('.close-btn');
    const refreshBtn = this.overlay.querySelector('.refresh-btn');

    closeBtn.addEventListener('click', () => this.closeSummary());
    refreshBtn.addEventListener('click', () => {
      this.closeSummary();
      this.generateUdnHomeSummary();
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeSummary();
      }
    });

    // ESC鍵關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay) {
        this.closeSummary();
      }
    });
  }

  // 監聽頁面變化
  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 頁面內容有變化，可能是動態載入了新內容
          console.log('檢測到頁面內容變化');
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 調試頁面元素
  debugPageElements() {
    console.log('=== 頁面調試信息 ===');
    console.log('頁面標題:', document.title);
    console.log('頁面URL:', window.location.href);

    // 檢查常見的新聞頁面元素
    const elementsToCheck = [
      'article', '.article', '#article',
      '.news-content', '.story-content', '[role="article"]', '.post-content',
      '.text', '.text-content', '.article-text', '.content-text',
      '.main-content', '.article-body', '.news-text', '.story-text',
      '.article-detail', '.boxTitle', '.whitecon', '.cont',
      'h1', 'h2', '.title', '.headline'
    ];

    console.log('頁面中存在的元素:');
    elementsToCheck.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`✓ ${selector}:`, element.textContent?.substring(0, 100) + '...');
      }
    });

    // 檢查所有段落
    const paragraphs = document.querySelectorAll('p');
    console.log(`頁面共有 ${paragraphs.length} 個段落`);

    if (paragraphs.length > 0) {
      console.log('前3個段落內容:');
      Array.from(paragraphs).slice(0, 3).forEach((p, index) => {
        const text = p.textContent?.trim();
        if (text && text.length > 20) {
          console.log(`段落 ${index + 1}:`, text.substring(0, 150) + '...');
        }
      });
    }

    // 檢查頁面的主要容器
    const containers = document.querySelectorAll('div[class*="content"], div[class*="article"], div[class*="news"], div[class*="story"]');
    console.log(`找到 ${containers.length} 個可能的內容容器`);

    containers.forEach((container, index) => {
      if (index < 5) { // 只顯示前5個
        console.log(`容器 ${index + 1} (${container.className}):`, container.textContent?.substring(0, 100) + '...');
      }
    });
  }
}

// 初始化
const summarizer = new NewsSummarizer();

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => summarizer.init());
} else {
  summarizer.init();
}