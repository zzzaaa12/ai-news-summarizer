# AI News Summarizer

🤖 一個智能新聞摘要 Chrome 擴展，支援多個 AI 服務自動為新聞文章生成摘要，並提供 UDN 首頁新聞列表自動整理功能。

## ✨ 功能特色

- 🎯 **自動檢測新聞頁面** - 智能識別新聞文章並自動生成 AI 摘要
- 📰 **UDN 首頁自動摘要** - 訪問 UDN 首頁時自動顯示整理後的新聞列表
- 🤖 **多 AI 服務支援** - 支援 OpenAI GPT、Google Gemini、xAI Grok、Cloudflare Workers AI
- 🌏 **廣泛網站支援** - 涵蓋台灣及國際主要新聞媒體 (24+ 網站)
- 📱 **響應式設計** - 完美適配桌面和手機瀏覽器
- 🎨 **現代化 UI** - 美觀的摘要顯示界面，支援 Markdown 格式
- ⚡ **即時狀態提示** - 頂部狀態條顯示處理進度
- 🔄 **一鍵重新整理** - 快速更新新聞列表內容

## 🌐 支援的新聞網站

### 國際媒體
- CNN, BBC, Reuters, AP News
- Yahoo News (各地區版本)

### 台灣媒體
- 中央社 (CNA)、聯合新聞網 (UDN)、中時新聞網
- 自由時報、TVBS、ETtoday、三立新聞網
- 風傳媒、今日新聞、新頭殼、CTWANT、鏡週刊

### 財經媒體
- 商業周刊、天下雜誌、遠見雜誌

## 🚀 安裝方式

### 方法一：從 Chrome Web Store 安裝
*（即將上架）*

### 方法二：手動安裝開發版
1. 下載或克隆此專案
2. 打開 Chrome 瀏覽器，前往 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇專案資料夾
6. 擴展安裝完成！

## ⚙️ 設定說明

1. 點擊瀏覽器工具列中的擴展圖示
2. 選擇偏好的 AI 服務：
   - **Google Gemini** (預設，免費額度較高)
   - **OpenAI GPT** (品質優秀)
   - **xAI Grok** (最新技術)
   - **Cloudflare Workers AI** (經濟實惠)
3. 輸入對應的 API 密鑰
4. 選擇偏好的 AI 模型
5. 保存設定

> 💡 **提示**：UDN 首頁摘要功能無需 API 密鑰，可直接使用！

## 🔑 API 密鑰取得方式

### Google Gemini
1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 登入 Google 帳號
3. 點擊「Get API Key」
4. 複製 API 密鑰（格式：`AI...`）

### OpenAI GPT
1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊並登入帳號
3. 前往 API Keys 頁面
4. 創建新的 API 密鑰（格式：`sk-...`）

### xAI Grok
1. 前往 [xAI Console](https://console.x.ai/)
2. 註冊並登入帳號
3. 創建 API 密鑰（格式：`xai-...`）

### Cloudflare Workers AI
1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 註冊並登入帳號
3. 取得 Account ID 和 API Token
4. 在設定中分別輸入兩個值

## 📖 使用方式

### 新聞文章摘要
1. **自動摘要**：訪問支援的新聞網站，擴展會自動檢測並生成摘要
2. **手動摘要**：點擊頁面右下角的「📰 生成摘要」按鈕
3. **查看摘要**：摘要會以彈窗形式顯示，支援粗體等格式
4. **關閉摘要**：點擊關閉按鈕或按 ESC 鍵

### UDN 首頁新聞摘要 🆕
1. **訪問 UDN 首頁**：前往 [udn.com/news/index](https://udn.com/news/index)
2. **自動顯示**：頁面載入完成後會自動顯示新聞摘要頁面
3. **瀏覽新聞**：系統會擷取並整理首頁所有新聞（最多 50 則）
4. **重新整理**：點擊右上角 🔄 按鈕更新新聞列表
5. **手動觸發**：也可點擊右上角「📰 生成首頁摘要」按鈕
6. **開啟新聞**：點擊標題直接跳轉到原文
7. **關閉摘要**：點擊 ✕ 按鈕或按 ESC 鍵關閉

#### 擷取的資訊包含：
- 📰 新聞標題和連結
- 📝 新聞摘要內容
- ⏰ 發布時間
- 🖼️ 新聞圖片（如有）

## 🎯 使用場景

### 適合的使用者
- 📚 **學生和研究者** - 快速了解新聞要點
- 💼 **商務人士** - 高效獲取重要資訊
- 🌐 **多語言使用者** - 繁體中文摘要更易理解
- 📱 **行動用戶** - 手機瀏覽新聞更便利

### 主要優勢
- ⚡ **節省時間** - 快速掌握新聞重點
- 🎯 **重點突出** - AI 智能提取關鍵資訊
- 🔄 **即時更新** - 支援動態內容載入
- 🛡️ **隱私保護** - 本地處理，安全可靠

## 🛠️ 技術架構

- **Manifest V3** - 使用最新的 Chrome 擴展標準
- **Content Scripts** - 注入新聞頁面進行內容分析
- **Background Service Worker** - 處理擴展生命週期
- **Chrome Storage API** - 安全存儲用戶設定
- **多 AI API 整合** - 支援 OpenAI、Gemini、xAI

## 🔒 隱私保護

- ✅ API 密鑰僅存儲在本地瀏覽器中
- ✅ 不收集任何個人資料
- ✅ 新聞內容僅傳送至您選擇的 AI 服務
- ✅ 開源透明，可自行檢視程式碼

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📝 更新日誌

### v1.0.0 (2025-01-26)
- 🎉 首次發布
- ✨ 支援 4 大 AI 服務：OpenAI GPT、Google Gemini、xAI Grok、Cloudflare Workers AI
- 📰 **新功能**：UDN 首頁新聞列表自動摘要
- � 支援 24+  新聞網站
- 🎨 現代化 UI 設計，支援深色模式
- 📱 完全響應式設計
- ⚡ 智能內容擷取和錯誤處理
- 🔒 本地存儲 API 密鑰，保護隱私

## 📄 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 文件

## 🙋‍♂️ 支援與回饋

如有問題或建議，請：
- 提交 [GitHub Issue](../../issues)
- 或發送郵件至 [your-email@example.com]

---

⭐ 如果這個專案對您有幫助，請給個星星支持！