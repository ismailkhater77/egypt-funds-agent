const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");

async function get(table, select, extra = "") {
  const url = `${baseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}${extra}`;
  const response = await fetch(url, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  return response.json();
}

const [funds, sources, prices] = await Promise.all([
  get("funds", "fund_id,canonical_name"),
  get("sources", "source_id,source_url"),
  get("fund_prices", "fund_id,valuation_date,nav,currency,status,collected_at"),
]);
const key = (row) => `${row.fund_id}|${row.valuation_date}`;
const counts = new Map();
for (const row of prices) counts.set(key(row), (counts.get(key(row)) ?? 0) + 1);
const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([snapshot, count]) => ({ snapshot, count }));
const statuses = prices.reduce((acc, row) => { acc[row.status ?? "null"] = (acc[row.status ?? "null"] ?? 0) + 1; return acc; }, {});
const latest = prices.reduce((max, row) => row.valuation_date > max ? row.valuation_date : max, "");
console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  counts: { funds: funds.length, sources: sources.length, fund_prices: prices.length, distinct_fund_dates: counts.size, latest_valuation_date: latest },
  statuses,
  duplicate_snapshot_groups: duplicates.length,
  duplicates: duplicates.slice(0, 20),
}, null, 2));
