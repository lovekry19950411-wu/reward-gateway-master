# Airtable + World ID H5 Proxy

這個範本把 H5 遊戲前端和 Airtable API 分開：前端呼叫本機後端，後端才使用 Airtable PAT 寫入資料表。

## 設定

1. 複製 `.env.example` 成 `.env`
2. 填入你的 Airtable PAT：

```env
AIRTABLE_PAT=pat_your_personal_access_token
AIRTABLE_BASE_ID=appbYPgnacH3fK7fs
PORT=3000
ALLOWED_ORIGIN=http://localhost:3000
```

3. 啟動：

```bash
npm run dev
```

4. 打開瀏覽器：

```text
http://localhost:3000
```

## 目前可用的 H5 畫面

`public/index.html` 目前是 Reward Arcade MVP 插槽式大廳。畫面採雙語切換：英文作為系統主名稱，中文作為操作輔助。

- Login / 登入：Email 與推薦碼入口，先留下會員資料。
- Redeem / 兌換：顯示可兌換分數、票券與錢包預留欄位。
- Quick Actions：Service、Record、Daily、Store、Lucky Spin 五個可插入面板。
- Game Lobby：9 個遊戲/API/支付插槽，可逐步替換成真功能。
- Theme：Gold 深色版與 Light 亮色版可切換。
- Language：English / 中文可切換。

目前可確定的 MVP 元件：

- 會員 ID
- Email / invite code
- Referral code / 專屬推薦碼
- Redeemable points
- Tickets
- Wallet placeholder
- Mini App entry placeholder
- Daily Spin / 每日轉盤
- Game/API card slots
- Partner contact / 合作聯繫方式

之後可插入的功能：

- World App / MiniKit login
- Base smart wallet
- Payment API
- Third-party game API
- Reward / ticket backend
- Referral tracking

## 合作聯繫

- Telegram: [@richmrking](https://t.me/richmrking)
- Email: `lovekry19950411@gmail.com`
- Airtable / Supabase member records

產品架構紀錄在 `WLD_ECOSYSTEM_ARCHITECTURE.md`。

30-60-90 天執行路線圖在 `WLD_TREASURE_90_DAY_ROADMAP.md`。

如果 Vercel billing 擋住部署，改用 Cloudflare Pages，設定看 `CLOUDFLARE_DEPLOY.md`。

正式接 World ID 時，請把 IDKit 驗證成功後的結果送到 `/api/world-id/register`。目前頁面先提供測試輸入，方便確認 Airtable 寫入流程。

## API 端點

### World ID 登錄

```http
POST /api/world-id/register
```

```json
{
  "nullifierHash": "world-id-nullifier",
  "walletAddress": "0x1234..."
}
```

### 任務完成

```http
POST /api/tasks/complete
```

```json
{
  "userRecordId": "recXXXXX",
  "taskName": "每日登入獎勵",
  "rewardPoints": 100,
  "rewardTokens": 50
}
```

### 投入抽獎池

```http
POST /api/lottery/deposit
```

```json
{
  "userRecordId": "recXXXXX",
  "poolName": "六月幸運大抽獎",
  "savingsAmount": 500,
  "ticketCount": 10
}
```

### 建立質押貸款與交易流水

```http
POST /api/loans/create
```

```json
{
  "userRecordId": "recXXXXX",
  "walletAddress": "0x1234...abcd",
  "collateralValue": 1000,
  "amount": 500,
  "txHash": "0xabc123...txhash"
}
```

## 表格對照

| 表格 | Table ID |
| --- | --- |
| 用戶與 WLD 驗證 | `tblyech4Bk4BTga02` |
| 任務與社交裂變 | `tblscgHtLqgVX9hd9` |
| 儲蓄與抽獎池 | `tblJ4oHcIzBwqDxZj` |
| 劃時代貨幣經濟學 | `tblHICS6hSCqNtn12` |
| 質押與貸款業務 | `tblqsVs9BhYDKlVzQ` |
| 鏈上交易流水 | `tbla02cOYOSQThxwo` |

## World ID 前端串接位置

World ID SDK 驗證成功後，請把結果送到 `/api/world-id/register`，不要直接從瀏覽器呼叫 Airtable。

```js
async function handleWorldIDSuccess(result) {
  const response = await fetch('/api/world-id/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nullifierHash: result.nullifier_hash,
      walletAddress: result.wallet_address
    })
  });

  return response.json();
}
```
