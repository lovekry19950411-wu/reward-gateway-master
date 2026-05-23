# WLD Ecosystem Architecture

這份紀錄定義目前專案的主線：WLD / World ID 作為流量入口，H5 Lucky Game 作為用戶互動與留存層，Airtable 作為 MVP 後台，最後把高意願用戶導入 LD Core。

```text
WLD Ecosystem
|
|-- Traffic Entry / 流量入口
|   |-- H5 Lucky Game
|   |-- Telegram
|   |-- LINE
|   |-- Web
|
|-- User Data / 用戶資料
|   |-- World ID
|   |-- Users
|   |-- Profile
|
|-- Engagement / 活動留存
|   |-- Daily Tasks / 今日任務
|   |-- Points / 積分
|   |-- Airdrop Eligibility / 空投資格
|   |-- Invite Friends / 邀請好友
|   |-- Lottery Pool / 抽獎池
|
|-- Lending Conversion / 借貸轉換
|   |-- Lending Waitlist
|   |-- WLD Collateral Intent / WLD 抵押意向
|   |-- Borrowing Demand / 借款需求
|
|-- LD Core
|   |-- Risk Control / 風控
|   |-- Lending / 借款
|   |-- Repayment / 還款
```

## Product Positioning

目前 H5 Lucky Game 不是完整貸款系統，而是 LD Core 的前端流量與篩選入口。

```text
WLD / World ID
-> H5 Lucky Game
-> Tasks, Points, Lottery, Invite
-> Airtable Activity Backend
-> Lending Waitlist
-> LD Core
```

## Current Implementation

目前已完成：

- 本地 H5 前端原型
- Node.js 後端 Airtable proxy
- World ID mock registration
- Task completion write
- Lottery deposit write
- Loan record and transaction write
- Audit endpoint for reading Airtable records

## Next Build Order

1. Build WLD Treasure MVP screens: Home, Quest, Treasure, Profile, Admin.
2. Use Points, Keys, and Tickets before real token rewards.
3. Move lending from active product to Lending Interest / Waitlist.
4. Add identity stages: Guest, Active User, Verified User, Qualified User.
5. Keep Audit and Roadmap as admin-only tools.
6. Add World ID after the game loop is playable.
7. Validate lending demand before connecting LD Core.

See `WLD_TREASURE_90_DAY_ROADMAP.md` for the execution plan.
