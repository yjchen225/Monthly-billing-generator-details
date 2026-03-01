import React, { useMemo } from "react";
import Money from "./Money.jsx";

function fmtDateTime(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getDate()).padStart(2,"0")} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`;
}

function GiftTag() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
      贈品
    </span>
  );
}

export default function CustomerPage({ customer, dateRange, generatedAt }) {
  const created = useMemo(() => fmtDateTime(generatedAt), [generatedAt]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:shadow-none print:border-slate-300">
      {/* Customer title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-bold">{customer.customerName} {customer.customerId}</div>
          <div className="text-sm text-slate-600 mt-1">
            日期區間：{dateRange?.start || "—"} ～ {dateRange?.end || "—"}
          </div>
          <div className="text-xs text-slate-500 mt-1">製表時間：{created}</div>
        </div>
      </div>

     {/* Sales Table */}
<div className="mt-6">
  <div className="font-semibold">銷貨單商品明細</div>

  {customer.sales.length === 0 ? (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      本期無銷貨紀錄
    </div>
  ) : (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-sm border-collapse table-fixed">
        {/* 固定欄寬：讓 SO / 贈品 變窄，數字欄固定，商品名稱吃剩下空間 */}
        <colgroup>
          <col className="w-[150px]" />  {/* 銷貨單編號 */}
          <col />                        {/* 商品名稱（自動吃剩餘） */}
          <col className="w-[90px]" />   {/* 折抵後單價 */}
          <col className="w-[80px]" />   {/* 出貨數量 */}
          <col className="w-[64px]" />   {/* 贈品 */}
          <col className="w-[110px]" />  {/* 金額小計 */}
        </colgroup>

        <thead>
          <tr className="bg-slate-50">
            <th className="p-2 border border-slate-200 text-left whitespace-nowrap">銷貨單編號</th>
            <th className="p-2 border border-slate-200 text-left">商品名稱</th>
            <th className="p-2 border border-slate-200 text-right whitespace-nowrap">折抵後單價</th>
            <th className="p-2 border border-slate-200 text-right whitespace-nowrap">出貨數量</th>
            <th className="p-2 border border-slate-200 text-center whitespace-nowrap">贈品</th>
            <th className="p-2 border border-slate-200 text-right whitespace-nowrap">金額小計</th>
          </tr>
        </thead>

        <tbody>
          {customer.sales.map((row, idx) => {
            const prev = customer.sales[idx - 1];
            const sameSoConsecutive = prev && prev.soNo === row.soNo;
            const hideSo = sameSoConsecutive;

            return (
              <tr key={`${row.soNo}-${idx}`}>
                <td className="p-2 border border-slate-200 align-top whitespace-nowrap">
                  {hideSo ? "" : row.soNo}
                </td>

                {/* 商品名稱不換行：用 truncate 省略 */}
                <td className="p-2 border border-slate-200">
                  <div className="truncate">{row.productName}</div>
                </td>

                <td className="p-2 border border-slate-200 text-right whitespace-nowrap">
                  <Money value={row.unitPrice} />
                </td>

                <td className="p-2 border border-slate-200 text-right whitespace-nowrap">
                  {row.qty}
                </td>

                <td className="p-2 border border-slate-200 text-center whitespace-nowrap">
                  {row.isGift ? <GiftTag /> : ""}
                </td>

                <td className="p-2 border border-slate-200 text-right whitespace-nowrap">
                  <Money value={row.lineSubtotal} />
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-slate-50">
            <td className="p-2 border border-slate-200 font-semibold whitespace-nowrap" colSpan={5}>
              銷貨總額
            </td>
            <td className="p-2 border border-slate-200 text-right font-semibold whitespace-nowrap">
              <Money value={customer.salesTotal} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )}
</div>

      {/* Returns Table */}
<div className="mt-6">
  <div className="font-semibold">退換貨商品明細</div>

  {customer.rmas.length === 0 ? (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      本期無退換貨紀錄
    </div>
  ) : (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-sm border-collapse table-fixed">
        {/* 固定欄寬：RMA 窄、數字欄固定、商品名稱吃剩餘 */}
        <colgroup>
          <col className="w-[170px]" /> {/* 退換貨單號 */}
          <col />                       {/* 商品名稱 */}
          <col className="w-[90px]" />  {/* 折抵後單價 */}
          <col className="w-[110px]" /> {/* 申請退換貨數量 */}
          <col className="w-[140px]" /> {/* 申請退換貨金額小計 */}
        </colgroup>

        <thead>
          <tr className="bg-slate-50">
            <th className="p-2 border border-slate-200 text-left whitespace-nowrap">退換貨單號</th>
            <th className="p-2 border border-slate-200 text-left">商品名稱</th>
            <th className="p-2 border border-slate-200 text-right whitespace-nowrap">折抵後單價</th>
            <th className="p-2 border border-slate-200 text-right whitespace-nowrap">申請退換貨數量</th>
            <th className="p-2 border border-slate-200 text-right whitespace-nowrap">申請退換貨金額小計</th>
          </tr>
        </thead>

        <tbody>
          {customer.rmas.map((row, idx) => (
            <tr key={`${row.rmaNo}-${idx}`}>
              <td className="p-2 border border-slate-200 whitespace-nowrap">{row.rmaNo}</td>

              <td className="p-2 border border-slate-200">
                <div className="truncate">{row.productName}</div>
              </td>

              <td className="p-2 border border-slate-200 text-right whitespace-nowrap">
                <Money value={row.unitPrice} />
              </td>

              <td className="p-2 border border-slate-200 text-right whitespace-nowrap">
                {row.qty}
              </td>

              <td className="p-2 border border-slate-200 text-right whitespace-nowrap">
                <Money value={row.lineSubtotal} />
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-slate-50">
            <td className="p-2 border border-slate-200 font-semibold whitespace-nowrap" colSpan={4}>
              退貨總額
            </td>
            <td className="p-2 border border-slate-200 text-right font-semibold whitespace-nowrap">
              <Money value={customer.returnsTotal} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )}
</div>

      {/* Settlement line */}
      <div className="mt-6 flex justify-end">
        <div className="text-right text-sm">
          <span className="font-semibold">{customer.customerName}</span>
          <span className="ml-1">本期請款金額：</span>
          <span className="ml-1 font-extrabold">NT$ <Money value={customer.net} /></span>
        </div>
      </div>
    </div>
  );
}
