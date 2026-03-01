export function normalizeString(s) {
  return String(s ?? "").trim();
}

export function normalizeHeaderKey(s) {
  // trim + collapse whitespace to reduce header mismatch from accidental spaces
  return normalizeString(s).replace(/\s+/g, " ");
}

export function parseMoney(value) {
  const raw = normalizeString(value);
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function extractNumericSuffix(id) {
  const s = normalizeString(id);
  const m = s.match(/(\d+)\s*$/);
  return m ? Number(m[1]) : Number.NaN;
}

export function parseGiftFlag(v) {
  const s = normalizeString(v).toLowerCase();
  return s === "是" || s === "y" || s === "yes" || s === "true" || s === "1";
}

export function formatDateRangeDisplay(isoDate) {
  // input: YYYY-MM-DD from <input type="date">
  const s = normalizeString(isoDate);
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  return `${m[1]}/${m[2]}/${m[3]}`;
}
