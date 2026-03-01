import { normalizeString, parseMoney, extractNumericSuffix, parseGiftFlag } from "./normalize.js";

export const REQUIRED_SALES_HEADERS = [
  "客戶編號",
  "客戶姓名",
  "銷貨單編號",
  "商品名稱",
  "折抵後單價",
  "出貨數量",
  "是否為贈品",
  "金額小計"
];

export const REQUIRED_RMA_HEADERS = [
  "客戶編號",
  "客戶姓名",
  "退換貨單號",
  "商品名稱",
  "折抵後單價",
  "申請退換貨數量",
  "申請退換貨金額小計"
];

const FIELDS = {
  sales: {
    customerId: "客戶編號",
    customerName: "客戶姓名",
    soNo: "銷貨單編號",
    productName: "商品名稱",
    unitPrice: "折抵後單價",
    qty: "出貨數量",
    isGift: "是否為贈品",
    lineSubtotal: "金額小計"
  },
  rma: {
    customerId: "客戶編號",
    customerName: "客戶姓名",
    rmaNo: "退換貨單號",
    productName: "商品名稱",
    unitPrice: "折抵後單價",
    qty: "申請退換貨數量",
    lineSubtotal: "申請退換貨金額小計"
  }
};

function pick(row, key) {
  return normalizeString(row[key]);
}

export function aggregateData(salesRows, rmaRows) {
  const map = new Map();

  // Sales: keep original index to preserve in-SO order when sorting
  salesRows.forEach((r, idx) => {
    const cid = pick(r, FIELDS.sales.customerId);
    if (!cid) return;
    const cname = pick(r, FIELDS.sales.customerName);

    const rec = map.get(cid) || {
      customerId: cid,
      customerName: cname,
      sales: [],
      rmas: []
    };

    rec.customerName = rec.customerName || cname;

    rec.sales.push({
      _idx: idx,
      soNo: pick(r, FIELDS.sales.soNo),
      productName: pick(r, FIELDS.sales.productName),
      unitPrice: parseMoney(pick(r, FIELDS.sales.unitPrice)),
      qty: parseMoney(pick(r, FIELDS.sales.qty)),
      isGift: parseGiftFlag(pick(r, FIELDS.sales.isGift)),
      lineSubtotal: parseMoney(pick(r, FIELDS.sales.lineSubtotal))
    });

    map.set(cid, rec);
  });

  // Returns
  rmaRows.forEach((r, idx) => {
    const cid = pick(r, FIELDS.rma.customerId);
    if (!cid) return;
    const cname = pick(r, FIELDS.rma.customerName);

    const rec = map.get(cid) || {
      customerId: cid,
      customerName: cname,
      sales: [],
      rmas: []
    };

    rec.customerName = rec.customerName || cname;

    rec.rmas.push({
      _idx: idx,
      rmaNo: pick(r, FIELDS.rma.rmaNo),
      productName: pick(r, FIELDS.rma.productName),
      unitPrice: parseMoney(pick(r, FIELDS.rma.unitPrice)),
      qty: parseMoney(pick(r, FIELDS.rma.qty)),
      lineSubtotal: parseMoney(pick(r, FIELDS.rma.lineSubtotal))
    });

    map.set(cid, rec);
  });

  // Sort customers: Cxxxxxxx by numeric part
  const customers = Array.from(map.values()).sort((a, b) => {
    const na = extractNumericSuffix(a.customerId);
    const nb = extractNumericSuffix(b.customerId);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.customerId.localeCompare(b.customerId);
  });

  customers.forEach(c => {
    // SO string sort, stable keeps _idx within same soNo
    c.sales.sort((a, b) => {
      const s = a.soNo.localeCompare(b.soNo, "zh-Hant");
      if (s !== 0) return s;
      return a._idx - b._idx;
    });

    c.rmas.sort((a, b) => {
      const s = a.rmaNo.localeCompare(b.rmaNo, "zh-Hant");
      if (s !== 0) return s;
      return a._idx - b._idx;
    });

    c.salesTotal = c.sales.reduce((sum, x) => sum + (x.lineSubtotal || 0), 0);
    c.returnsTotal = c.rmas.reduce((sum, x) => sum + (x.lineSubtotal || 0), 0);
    c.net = c.salesTotal - c.returnsTotal;
  });

  const grandTotal = customers.reduce((sum, c) => sum + (c.net || 0), 0);
  return { customers, grandTotal };
}
