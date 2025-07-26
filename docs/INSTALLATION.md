# 安裝指南

## 📋 系統需求

- Google Chrome 88+ 或其他 Chromium 核心瀏覽器
- 有效的 AI API 密鑰（至少一個）：
  - Google Gemini API 密鑰（推薦，免費額度較高）
  - OpenAI API 密鑰
  - xAI API 密鑰

## 🚀 安裝方式

### 方法一：Chrome Web Store（推薦）
*即將上架到 Chrome Web Store*

### 方法二：手動安裝開發版

#### 步驟 1：下載專案
```bash
# 使用 Git 克隆
git clone https://github.com/your-username/ai-news-summarizer.git

# 或直接下載 ZIP 檔案並解壓縮
```

#### 步驟 2：載入擴展
1. 打開 Chrome 瀏覽器
2. 在網址列輸入 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」開關
4. 點擊「載入未封裝項目」按鈕
5. 選擇專案資料夾
6. 擴展安裝完成！

#### 步驟 3：驗證安裝
- 在瀏覽器工具列應該會看到擴展圖示
- 點擊圖示應該會開啟設定頁面

## ⚙️ 初始設定

### 1. 選擇 AI 服務
點擊擴展圖示，在設定頁面中選擇您偏好的 AI 服務：

- **Google Gemini**（推薦新手）
  - 免費額度較高
  - 回應速度快
  - 支援繁體中文

- **OpenAI GPT**（推薦進階用戶）
  - 摘要品質優秀
  - 多種模型選擇
  - 成熟穩定

- **xAI Grok**（最新技術）
  - 最新的 AI 技術
  - 獨特的回應風格
  - 持續改進中

### 2. 取得 API 密鑰

#### Google Gemini API
1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 使用 Google 帳號登入
3. 點擊「Get API Key」
4. 創建新的 API 密鑰
5. 複製密鑰（格式：`AI...`）

#### OpenAI API
1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊並登入帳號
3. 前往「API Keys」頁面
4. 點擊「Create new secret key」
5. 複製密鑰（格式：`sk-...`）

#### xAI API
1. 前往 [xAI Console](https://console.x.ai/)
2. 註冊並登入帳號
3. 創建新的 API 密鑰
4. 複製密鑰（格式：`xai-...`）

### 3. 配置擴展
1. 在設定頁面中選擇 AI 服務
2. 輸入對應的 API 密鑰
3. 選擇偏好的 AI 模型
4. 點擊「保存設定」

## 🧪 測試安裝

1. 前往任一支援的新聞網站（如：[聯合新聞網](https://udn.com)）
2. 打開任一新聞文章
3. 應該會看到：
   - 頂部出現「正在產生新聞摘要...」狀態條
   - 右下角出現「📰 生成摘要」按鈕
   - 摘要生成完成後會自動彈出摘要視窗

## 🔧 疑難排解

### 擴展無法載入
- 確認已開啟「開發人員模式」
- 檢查專案資料夾是否包含 `manifest.json`
- 重新整理擴展頁面並重新載入

### 沒有出現摘要功能
- 確認當前網站是否在支援清單中
- 檢查是否已正確設定 API 密鑰
- 打開開發者工具查看控制台錯誤訊息

### API 錯誤
- 確認 API 密鑰格式正確
- 檢查 API 密鑰是否有效且有足夠額度
- 確認網路連線正常

### 摘要品質不佳
- 嘗試切換不同的 AI 服務或模型
- 確認新聞文章內容完整且為繁體中文

## 📞 取得協助

如果遇到問題：
1. 查看 [常見問題](FAQ.md)
2. 搜尋 [GitHub Issues](../../issues)
3. 創建新的 Issue 回報問題
4. 聯絡開發者：your-email@example.com

## 🔄 更新擴展

### 自動更新（Chrome Web Store 版本）
- Chrome 會自動更新已安裝的擴展

### 手動更新（開發版）
1. 下載最新版本的程式碼
2. 在 `chrome://extensions/` 頁面點擊擴展的「重新載入」按鈕
3. 或移除舊版本後重新安裝新版本