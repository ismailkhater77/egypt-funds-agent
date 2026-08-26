const asOfDate = "2026-08-26";
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function db(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

const [funds, prices] = await Promise.all([
  db("funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&limit=500"),
  db("fund_prices?select=fund_id,valuation_date,status&status=eq.validated&limit=5000"),
]);
const covered = new Set(prices.filter((row) => row.valuation_date <= asOfDate).map((row) => row.fund_id));
const linkedGaps = funds.filter((fund) => fund.price_update_url && !covered.has(fund.fund_id));

const [azimutResponse, zaldiResponse] = await Promise.all([
  fetch("https://app.azimut.eg/api/fund/list?size=100&web=true"),
  fetch("https://zaldi-capital.com/"),
]);
const azimutJson = azimutResponse.ok ? await azimutResponse.json() : { fetchStatus: azimutResponse.status };
const azimutFunds = azimutJson?.response?.funds?.dataList ?? [];
const abcCandidates = azimutFunds.filter((fund) => /abc/i.test(`${fund.name ?? ""} ${fund.id ?? ""}`)).map((fund) => ({ name: fund.name, last_nav: fund.last_nav ?? null, graphCount: Array.isArray(fund.graph) ? fund.graph.length : 0 }));
const zaldiHtml = zaldiResponse.ok ? await zaldiResponse.text() : "";

console.log(JSON.stringify({
  asOfDate,
  linkedGaps,
  azimut: { status: azimutResponse.status, abcCandidates },
  zaldi: { status: zaldiResponse.status, hasZaldiStarEquityText: /Zaldi Star Equity/i.test(zaldiHtml), hasNavUnitText: /NAV\/UNIT/i.test(zaldiHtml), bodyLength: zaldiHtml.length },
}, null, 2));
