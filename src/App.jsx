import React, { useMemo, useState } from "react";
import FileUploadCard from "./components/FileUploadCard.jsx";
import Preview from "./components/Preview.jsx";
import Alerts from "./components/Alerts.jsx";
import { readFirstSheet, validateHeaders } from "./lib/excel.js";
import { aggregateData, REQUIRED_RMA_HEADERS, REQUIRED_SALES_HEADERS } from "./lib/aggregate.js";
import { formatDateRangeDisplay } from "./lib/normalize.js";

export default function App() {
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");

  const [salesFile, setSalesFile] = useState(null);
  const [rmaFile, setRmaFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [result, setResult] = useState(null);

  const dateOk = useMemo(() => !!startDate && !!endDate, [startDate, endDate]);

  const canGenerate = useMemo(
    () => !!salesFile && !!rmaFile && dateOk && !loading,
    [salesFile, rmaFile, dateOk, loading]
  );

  async function onGenerate() {
    setErrors([]);
    setResult(null);
    setLoading(true);

    try {
      const sales = await readFirstSheet(salesFile);
      const rma = await readFirstSheet(rmaFile);

      const v1 = validateHeaders(sales.headers, REQUIRED_SALES_HEADERS);
      const v2 = validateHeaders(rma.headers, REQUIRED_RMA_HEADERS);

      const nextErrors = [];
      if (!dateOk) nextErrors.push("請先填寫開始日期與結束日期。");
      if (!v1.ok) nextErrors.push(`「銷貨單商品明細」缺少欄位：${v1.missing.join(", ")}`);
      if (!v2.ok) nextErrors.push(`「退換貨商品明細」缺少欄位：${v2.missing.join(", ")}`);

      if (nextErrors.length) {
        setErrors(nextErrors);
        return;
      }

      const aggregated = aggregateData(sales.rows, rma.rows);

      setResult({
        generatedAt: new Date(),
        salesSheetName: sales.sheetName,
        rmaSheetName: rma.sheetName,
        dateRange: {
          start: formatDateRangeDisplay(startDate),
          end: formatDateRangeDisplay(endDate)
        },
        ...aggregated
      });
    } catch (e) {
      setErrors([`讀取檔案失敗：${e?.message || String(e)}`]);
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setStartDate("");
    setEndDate("");
    setSalesFile(null);
    setRmaFile(null);
    setErrors([]);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="no-print sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">月結請款單明細表生成器</div>
            <div className="text-xs text-slate-500">輸入日期區間 → 上傳兩份 Excel → 生成 A4 報表</div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-40"
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              {loading ? "生成中…" : "生成報表"}
            </button>
            <button
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              onClick={onReset}
              disabled={loading}
            >
              重設
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-40"
              onClick={() => window.print()}
              disabled={!result}
            >
              列印 / 存成 PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="font-semibold">日期設定</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-sm text-slate-700">開始日期</div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm text-slate-700">結束日期</div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-2 text-xs text-slate-500">報表會以 YYYY/MM/DD 顯示日期區間（此日期僅用於顯示，不會篩選資料）。</div>
        </div>

        <div className="no-print mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploadCard
            title="銷貨單商品明細"
            hint="固定讀取第1個工作表、表頭在第1列"
            file={salesFile}
            onChange={setSalesFile}
            accept=".xlsx,.xls"
          />
          <FileUploadCard
            title="退換貨商品明細"
            hint="固定讀取第1個工作表、表頭在第1列"
            file={rmaFile}
            onChange={setRmaFile}
            accept=".xlsx,.xls"
          />
        </div>

        <div className="no-print mt-4">
          <Alerts errors={errors} />
        </div>

        {result && (
          <div className="mt-6">
            <Preview result={result} />
          </div>
        )}

        {!result && (
          <div className="no-print mt-8 text-sm text-slate-600">
            1) 輸入開始/結束日期（僅顯示）<br />
            2) 上傳兩份 Excel（銷貨商品明細 / 銷退單商品明細）<br />
            3) 點「生成報表」產生預覽<br />
            4) 點「列印 / 存成 PDF」輸出 A4
          </div>
        )}
      </main>
    </div>
  );
}
