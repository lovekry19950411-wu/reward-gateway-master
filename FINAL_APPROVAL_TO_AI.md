# 給 Airtable AI 的最終回覆

可以繼續進行設定，但請依照以下規則執行：

## 一、不要再依賴中文表格名稱

你前面多次把中文表名改錯，因此後續請一律以 Table ID 為準。

正確 Table ID 如下：

| 用途 | Table ID |
| --- | --- |
| 用戶與 WLD 驗證 | `tblyech4Bk4BTga02` |
| 任務與社交裂變 | `tblscgHtLqgVX9hd9` |
| 儲蓄與抽獎池 | `tblJ4oHcIzBwqDxZj` |
| 劃時代貨幣經濟學 | `tblHICS6hSCqNtn12` |
| 質押與貸款業務 | `tblqsVs9BhYDKlVzQ` |
| 鏈上交易流水 | `tbla02cOYOSQThxwo` |

只要 Table ID 正確，中文表格名稱可以忽略。

## 二、可以建立的自動化

### Automation 1：任務完成自動發放獎勵

觸發：

- Table ID：`tblscgHtLqgVX9hd9`
- 新增記錄
- 任務狀態為「已完成」

動作：

- 找到 `tblHICS6hSCqNtn12` 中同一用戶的代幣經濟記錄
- 增加用戶代幣餘額
- 在 `tbla02cOYOSQThxwo` 新增一筆交易流水
- 交易類型：任務獎勵
- 狀態：完成

### Automation 2：抽獎池投入自動扣款與記錄

觸發：

- Table ID：`tblJ4oHcIzBwqDxZj`
- 新增記錄

動作：

- 找到 `tblHICS6hSCqNtn12` 中同一用戶的代幣經濟記錄
- 扣除投入抽獎池的代幣或抽獎券數量
- 在 `tbla02cOYOSQThxwo` 新增一筆交易流水
- 交易類型：抽獎池投入
- 狀態：完成

### Automation 3：貸款借出自動記錄

觸發：

- Table ID：`tblqsVs9BhYDKlVzQ`
- 新增記錄
- 還款狀態為「履約中」

動作：

- 在 `tbla02cOYOSQThxwo` 新增一筆交易流水
- 交易類型：貸款借出
- 狀態：完成
- 金額使用實際借出數量或借款金額欄位
- 保留 Tx Hash、關聯訂單 ID、錢包地址、對應用戶

### Automation 4：貸款結清自動記錄

觸發：

- Table ID：`tblqsVs9BhYDKlVzQ`
- 還款狀態變更為「已結清」

動作：

- 在 `tbla02cOYOSQThxwo` 新增一筆交易流水
- 交易類型：貸款結清
- 狀態：完成
- 金額使用實際還款金額
- 保留關聯訂單 ID 與對應用戶

## 三、欄位建立規則

「電子郵件」與「使用者等級」如果已經存在，不要重複建立。

可以建議新增「結清時間」欄位，但請先只列為建議，不要直接建立，除非我再次確認。

## 四、執行前請回報

在真正執行前，請先列出：

- 會修改哪個 Table ID
- 會新增哪個 Automation
- 會新增或更新哪些欄位
- 是否會建立測試資料

確認後再執行。
