# Human Quest Master Template

這個資料夾是目前母版底板的說明，不是另一份克隆版程式。

目前正式母版位置：

```text
C:\Users\lovek\Documents\Codex\2026-05-23\1-airtable-api-key-base-id
```

主要入口檔案：

```text
public/index.html
```

## 母版定位

這不是 WLD 專版，也不是 Base 專版。

這是一個可複製的通用入口底板：

```text
Human Quest
= 私域會員入口
+ 信箱收集
+ 推薦碼
+ 點數/票券
+ 每日轉盤
+ 兌換中心
+ 錢包預留
+ 遊戲/API/廣告插槽
+ 合作聯繫
```

未來可用同一份底板切成：

```text
?app=wld
?app=base
?app=game
?app=ai
```

但目前先保留為通用母版，不建立克隆版。

## 前端固定模組

- Claim Pass / 領取通行證
- Email / 信箱
- Invite Code / 推薦碼輸入
- Member ID / 會員 ID
- Referral Code / 專屬推薦碼
- HQ Points / 可兌換分數
- Tickets / 票券
- Daily Spin / 每日轉盤
- Redeem Center / 兌換中心
- Wallet Placeholder / 錢包預留
- Mini App Entry / Mini App 入口
- Service / Record / Daily / Store / Lucky Spin 快捷入口
- Game/API/Ad Slots / 可插入卡片
- English / 中文切換
- Gold / Light 主題切換
- 合作聯繫：
  - TG: `@richmrking`
  - Email: `lovekry19950411@gmail.com`

## 後端固定模組

正式部署建議使用：

```text
Vercel API Routes
+ Supabase Free Plan
```

目前已建立通用 API：

```text
POST /api/gateway/member
POST /api/gateway/event
POST /api/gateway/reward
GET  /api/gateway/audit
```

Supabase 表：

```text
gateway_members
gateway_events
gateway_ledger
```

建表 SQL：

```text
supabase_schema.sql
```

## 會記錄什麼

Members:

```text
memberId
email
inviteCode
referralCode
sourceApp
points
tickets
createdAt
```

Events:

```text
memberId
sourceApp
eventType
card
metadata
createdAt
```

Ledger:

```text
memberId
sourceApp
pointsDelta
ticketsDelta
reason
metadata
createdAt
```

## 部署前要做

1. 建立 Supabase 專案。
2. 在 Supabase SQL editor 執行 `supabase_schema.sql`。
3. 到 Vercel 設定環境變數：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

4. 推到 GitHub。
5. 部署到 Vercel。

## 注意

- `.env` 不要上傳。
- `SUPABASE_SERVICE_ROLE_KEY` 只能放在 Vercel 後端環境變數。
- 前端不可直接使用 service role key。
- 點數目前是平台內使用，不代表現金、投資收益或代幣承諾。
