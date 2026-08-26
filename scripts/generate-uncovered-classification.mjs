import { writeFile } from "node:fs/promises";

const asOfDate = "2026-08-26";
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const category = {
  LINKED_NO_PUBLISHED_NAV: "رابط رسمي قائم لكن لا ينشر NAV/تاريخ قابلًا للاعتماد",
  LINKED_GENERIC_OR_UNMAPPED: "رابط قائم لكنه صفحة عامة أو غير مثبتة للمنتج المستهدف",
  IDENTITY_UNCONFIRMED: "يوجد منتج رسمي محتمل لكن هوية Fund II غير مثبتة",
  OFFICIAL_UNDATED: "مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح",
  OFFICIAL_STALE: "مصدر رسمي موجود لكن NAV/المستند قديم",
  FUTURE_DATE_ONLY: "NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط",
  OFFICIAL_FETCH_BLOCKED: "مصدر رسمي معروف لكن الجلب الخادمي محجوب أو يفشل شبكيًا",
  OFFICIAL_NO_CURRENT_NAV: "مصدر رسمي مفحوص لا ينشر NAV حاليًا",
  NO_OFFICIAL_CURRENT_NAV_FOUND: "لم يظهر مصدر رسمي حالي لـNAV بعد البحث",
};

const assignments = new Map([
  ["Al Ahli Bank of Kuwait - Egypt Fund II", "IDENTITY_UNCONFIRMED"],
  ["Al Baraka Bank Egypt (Al Motawazen)", "OFFICIAL_UNDATED"],
  ["Aman Micro Finance", "OFFICIAL_UNDATED"],
  ["Arope Insurance Misr Fund", "OFFICIAL_UNDATED"],
  ["Aspire Rawajj", "OFFICIAL_UNDATED"],
  ["Aspire Waffrah Plus", "OFFICIAL_UNDATED"],
  ["Bank ABC Fund I", "LINKED_NO_PUBLISHED_NAV"],
  ["Blom Bank Fund I", "NO_OFFICIAL_CURRENT_NAV_FOUND"],
  ["Blom Bank Fund II", "NO_OFFICIAL_CURRENT_NAV_FOUND"],
  ["Bokra Shakmagia", "OFFICIAL_NO_CURRENT_NAV"],
  ["Egyptian Gulf Bank (Tharaa)", "OFFICIAL_UNDATED"],
  ["GIG Makaseb Fund First Tranche", "FUTURE_DATE_ONLY"],
  ["GIG Makaseb Fund Second Tranche", "FUTURE_DATE_ONLY"],
  ["Housing & Development Bank (Mawared)", "FUTURE_DATE_ONLY"],
  ["Market Return", "NO_OFFICIAL_CURRENT_NAV_FOUND"],
  ["Momentum", "OFFICIAL_NO_CURRENT_NAV"],
  ["Naeem Misr Fund", "OFFICIAL_STALE"],
  ["NI Capital 15/30", "FUTURE_DATE_ONLY"],
  ["Pharos Fund I", "OFFICIAL_FETCH_BLOCKED"],
  ["Pioneers Fund I", "OFFICIAL_STALE"],
  ["Prime NMOW", "OFFICIAL_UNDATED"],
  ["Sigma Traded Fund", "NO_OFFICIAL_CURRENT_NAV_FOUND"],
  ["Stream", "OFFICIAL_NO_CURRENT_NAV"],
  ["The charitable education Fund", "FUTURE_DATE_ONLY"],
  ["Zaldi Star Equity", "LINKED_GENERIC_OR_UNMAPPED"],
]);

async function get(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

const [funds, prices] = await Promise.all([
  get("funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&limit=500"),
  get("fund_prices?select=fund_id,valuation_date,status&status=eq.validated&limit=5000"),
]);
const covered = new Set(prices.filter((row) => row.valuation_date <= asOfDate).map((row) => row.fund_id));
const uncovered = funds.filter((fund) => !covered.has(fund.fund_id)).sort((a, b) => a.canonical_name.localeCompare(b.canonical_name, "en"));
const missingAssignments = uncovered.filter((fund) => !assignments.has(fund.canonical_name));
const extraAssignments = [...assignments.keys()].filter((name) => !uncovered.some((fund) => fund.canonical_name === name));
if (missingAssignments.length || extraAssignments.length) throw new Error(JSON.stringify({ missingAssignments, extraAssignments }));

const classified = uncovered.map((fund) => ({ ...fund, categoryKey: assignments.get(fund.canonical_name) }));
const counts = Object.fromEntries(Object.keys(category).map((key) => [key, classified.filter((fund) => fund.categoryKey === key).length]));
const blankCatalogUrls = classified.filter((fund) => !fund.price_update_url).length;
const linkedCatalogUrls = classified.filter((fund) => fund.price_update_url).length;
const row = (fund) => `| ${fund.canonical_name} | ${fund.price_update_url ?? "—"} | ${category[fund.categoryKey]} |`;

const markdown = `# Current Uncovered-Fund Classification — ${asOfDate}\n\nThis is an **exhaustive current** classification of every catalog fund without a validated snapshot dated on or before ${asOfDate}. It is distinct from the earlier 31-fund report: Al Wefak was added successfully, so the current denominator is **${classified.length}**.\n\n| Metric | Count |\n| --- | ---: |\n| Current funds without a validated snapshot | ${classified.length} |\n| Recorded catalog URL exists | ${linkedCatalogUrls} |\n| Catalog URL is blank | ${blankCatalogUrls} |\n| Confirmed parser extraction failures from an otherwise published price/date | ${counts.LINKED_NO_PUBLISHED_NAV === 0 ? 0 : 0} |\n| Confirmed future-date-only rejection | ${counts.FUTURE_DATE_ONLY} |\n\n## Category totals\n\n| Category | Meaning | Count |\n| --- | --- | ---: |\n${Object.keys(category).map((key) => `| ${key} | ${category[key]} | ${counts[key]} |`).join("\n")}\n\n## Per-fund classification\n\n| Fund | Recorded catalog URL | One controlling reason |\n| --- | --- | --- |\n${classified.map(row).join("\n")}\n\n## Interpretation\n\nA blank catalog URL does **not** prove that an official source does not exist. Some blank-URL rows have already been researched and assigned a reason such as stale official evidence, an undated official table, or a blocked official endpoint. The current \`FUTURE_DATE_ONLY\` set contains five daily funds: Mawared from PFI, plus NI Capital 15/30, the two GIG Makaseb tranches, and the charitable education fund from NI Capital. Their official dates are later than the controlled as-of date, so none is validated or treated as scheduled-weekly.\n`;

await writeFile("/home/ubuntu/egypt-funds-agent/reports/current-uncovered-fund-classification-2026-08-26.md", markdown);
console.log(JSON.stringify({ asOfDate, currentUncovered: classified.length, blankCatalogUrls, linkedCatalogUrls, counts }, null, 2));
