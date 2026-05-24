# Cloudflare Pages Deploy

Vercel 目前被 billing 擋住，所以母版改用 Cloudflare Pages 作為免費部署替代。

## 建議架構

```text
Cloudflare Pages
- public/index.html
- functions/api/gateway/*

Supabase Free
- gateway_members
- gateway_events
- gateway_ledger
```

## Cloudflare Pages 設定

建立 Pages project 時：

```text
Framework preset: None
Build command: 留空
Build output directory: public
Root directory: 專案根目錄
```

環境變數：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Supabase

到 Supabase SQL Editor 執行：

```text
supabase_schema.sql
```

## 注意

- 不需要 Vercel。
- 不需要本機 24 小時開機。
- `.env` 不要上傳。
- `SUPABASE_SERVICE_ROLE_KEY` 只放 Cloudflare Pages 環境變數，不放前端。
