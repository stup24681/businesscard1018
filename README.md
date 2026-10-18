# 智慧虛擬名片夾 (CardVault Pro)

智慧虛擬名片夾是一個支援手機與電腦瀏覽器的全功能數位名片管理系統。具備四大核心資訊辨識、Google 地圖導航串接、Excel 匯出及 Gmail 批次客製化與 BCC 群發功能。

## 🌟 核心特色：全體使用者零設定直接使用 AI
本專案已建置 Vercel Serverless Function 後端代理 (`/api/ocr`)。
**任何使用者打開網站連結，都不需要輸入 API Key，即可直接使用拍照上傳與批量（上限 10 張）AI 辨識功能！**

---

## 🔑 如何在 Vercel 設定唯一的 GEMINI_API_KEY（只需管理者設定一次）

1. **取得免費的 Google Gemini API Key**：
   - 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)。
   - 點擊「Create API Key」，複製您的專屬金鑰。

2. **登入 Vercel 設定環境變數**：
   - 進入 [Vercel Dashboard](https://vercel.com/dashboard)。
   - 點擊您的名片夾專案（例如 `card-vault`）。
   - 點擊上方的 **Settings**（設定）分頁。
   - 點選左側選單的 **Environment Variables**（環境變數）。
   - 在表單中填入：
     - **Key**：`GEMINI_API_KEY`
     - **Value**：貼上您在步驟 1 取得的 Gemini API Key。
     - **Environments**：勾選 `Production`、`Preview`、`Development` 全部。
   - 點擊 **Save**。

3. **重新部署（Redeploy）生效**：
   - 到專案的 **Deployments** 頁面。
   - 點擊最新一筆部署右側的三個點（`...`），選擇 **Redeploy**。
   - 完成後，所有打開連結的使用者便能全自動享受 AI 名片辨識！

---

## 專案檔案結構
- `index.html`：前端介面、多帳號管理、Gmail 發信與 Excel 匯出。
- `api/ocr.js`：Vercel Serverless 後端代理，保護金鑰安全並執行 AI 名片辨識。
- `vercel.json`：路由與部署設定。
- `README.md`：說明手冊與設定指引。
