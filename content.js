// 新聞摘要內容腳本
class NewsSummarizer {
  constructor() {
    this.overlay = null;
    this.summaryModal = null;
    this.isProcessing = false;
  }

  // 初始化
  async init() {
    // 檢查是否為新聞頁面
    if (this.isNewsPage()) {
      await this.createSummaryButton();
      await this.autoSummarize();
    }
  }

  // 判斷是否為新聞頁面
  isNewsPage() {
    const newsIndicators = [
      'article', '.article', '#article',
      '.news-content', '.story-content',
      '[role="article"]', '.post-content'
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
      '.content p'
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

  // 獲取設定
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'aiService',
        'openaiApiKey',
        'geminiApiKey',
        'openaiModel',
        'geminiModel'
      ], (result) => {
        resolve({
          aiService: result.aiService || 'gemini',
          openaiApiKey: result.openaiApiKey,
          geminiApiKey: result.geminiApiKey,
          openaiModel: result.openaiModel || 'gpt-4o-mini',
          geminiModel: result.geminiModel || 'gemini-2.5-flash-lite-preview-06-17'
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
}

// 初始化
const summarizer = new NewsSummarizer();

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => summarizer.init());
} else {
  summarizer.init();
}