# Monthly-billing-generator (Detail Statement)

React + Vite + Tailwind + SheetJS(xlsx)  
純前端：上傳兩份 Excel（銷貨商品明細 / 退換貨商品明細），產生 A4 可列印的「月結請款單 - 明細表」。

## 開發
```bash
npm install
npm run dev
```

## 建置
```bash
npm run build
npm run preview
```

## 注意
- 固定讀取 Excel 的第 1 個工作表
- 固定第 1 列為 header
- 日期區間僅顯示，不會篩選資料
