# Reward Gateway Master

Reusable Reward Gateway master template.

This is not a WLD-only app and not a Base-only app. It is a general private traffic gateway for collecting members, referral codes, points, tickets, and campaign/game/API slot activity.

## Core Features

- Claim Pass / collect email
- Member ID
- Referral code
- Invite code
- Redeemable points
- Tickets
- Daily Spin
- Redeem Center placeholder
- Wallet placeholder
- Mini App entry placeholder
- Game / API / ad card slots
- English / Chinese switch
- Gold / Light theme switch
- Partner contact

## Partner Contact

- Telegram: [@richmrking](https://t.me/richmrking)
- Email: `lovekry19950411@gmail.com`

## Deploy Options

Vercel is currently blocked by account billing, so the recommended free deployment path is:

```text
Cloudflare Pages
+ Cloudflare Pages Functions
+ Supabase Free
```

See:

- `CLOUDFLARE_DEPLOY.md`
- `supabase_schema.sql`

## Cloudflare Pages Settings

```text
Framework preset: None
Build command: leave empty
Build output directory: public
Root directory: project root
```

Environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Supabase Tables

Run `supabase_schema.sql` in Supabase SQL Editor.

Tables:

- `gateway_members`
- `gateway_events`
- `gateway_ledger`

## API

Cloudflare Pages Functions:

```text
POST /api/gateway/member
POST /api/gateway/event
POST /api/gateway/reward
GET  /api/gateway/audit
```

Vercel API routes are also included under `api/`, but Cloudflare Pages is the preferred path for now.

## Important Notes

- Do not commit `.env`.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Points are for in-platform activities and redemption only.
- Points are not cash, investment products, yield products, or token promises.

## Master Template Folder

See:

```text
TEMPLATE_MASTER/README.md
```

## Local Preview

```bash
node server.js
```

Open:

```text
http://localhost:3000
```
