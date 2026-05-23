# 給新 AI 對話視窗的需求摘要

我要做一個 H5 Web3 DeFi 遊戲，前端可能跑在 Telegram Mini App、LINE Mini App 或一般網頁。資料後台使用 Airtable，Base ID 是：

```text
appbYPgnacH3fK7fs
```

請注意：Airtable Personal Access Token 不能放在前端，必須放在後端環境變數，由後端代理 Airtable API。

## Airtable 表格

| 功能 | Table ID |
| --- | --- |
| 用戶與 WLD 驗證 | `tblyech4Bk4BTga02` |
| 任務與社交裂變 | `tblscgHtLqgVX9hd9` |
| 儲蓄與抽獎池 | `tblJ4oHcIzBwqDxZj` |
| 劃時代貨幣經濟學 | `tblHICS6hSCqNtn12` |
| 質押與貸款業務 | `tblqsVs9BhYDKlVzQ` |
| 鏈上交易流水 | `tbla02cOYOSQThxwo` |

## 主要流程

1. 玩家點擊「使用 World ID 登錄」。
2. 前端整合 World ID IDKit SDK，玩家完成真人驗證。
3. 驗證成功後，前端呼叫後端 `/api/world-id/register`，後端寫入 Airtable「用戶與 WLD 驗證」表。
4. 玩家完成任務或分享連結時，前端呼叫 `/api/tasks/complete`，後端寫入「任務與社交裂變」表，狀態為已完成。
5. Airtable Automation 看到任務完成後，自動更新「劃時代貨幣經濟學」表的代幣餘額，並可新增交易記錄。
6. 玩家投入抽獎池時，前端呼叫 `/api/lottery/deposit`，後端寫入「儲蓄與抽獎池」表。
7. 玩家使用「抵押 WLD 借出專案代幣」時，先由鏈上合約或國庫錢包確認收到 WLD，再呼叫 `/api/loans/create`。
8. `/api/loans/create` 需要同時建立「質押與貸款業務」借貸訂單，以及「鏈上交易流水」Tx Hash 記錄。

## 已建立的本機範本

目前工作區已有一個零外部依賴的 Node.js 後端代理範本：

```text
C:\Users\lovek\Documents\Codex\2026-05-23\1-airtable-api-key-base-id
```

重要檔案：

```text
server.js
public/index.html
.env.example
README.md
```

啟動方式：

```bash
npm run dev
```

或：

```bash
node server.js
```

## 環境變數

```env
AIRTABLE_PAT=pat_your_personal_access_token
AIRTABLE_BASE_ID=appbYPgnacH3fK7fs
PORT=3000
ALLOWED_ORIGIN=http://localhost:3000
```

## 安全要求

- 不要在前端放 Airtable PAT。
- 後端要驗證請求資料格式。
- 上線時要加入使用者 session、World ID server-side proof verification、速率限制與防重放機制。
- Airtable 每個 Base 約每秒 5 次請求，需要避免前端連點造成爆量。

## 與 Airtable AI 溝通注意事項

如果 Airtable AI 把中文表名翻錯，不要繼續糾結中文名稱；請要求它一律以 Table ID 為準。只要 Table ID 正確，中文表名可以忽略。

在真正建立自動化或欄位前，要求 Airtable AI 先列出：

- 會修改哪個 Table ID
- 會新增哪個 Automation
- 會新增或更新哪些欄位
- 是否會建立測試資料
