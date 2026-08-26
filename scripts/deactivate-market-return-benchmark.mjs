const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const canonicalName = "Market Return";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const query = new URLSearchParams({
  select: "fund_id,canonical_name,eima_name_raw,management_company_raw,category,active,price_update_url,source_id,notes",
  canonical_name: `eq.${canonicalName}`,
  limit: "2",
});
const lookup = await fetch(`${base}/rest/v1/funds?${query}`, { headers });
if (!lookup.ok) throw new Error(`Market Return lookup failed: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
const rows = await lookup.json();
if (rows.length !== 1) throw new Error(`Expected one Market Return catalog record; found ${rows.length}`);
const benchmark = rows[0];
if (benchmark.eima_name_raw !== canonicalName || benchmark.management_company_raw !== "EGX 30" || benchmark.category !== null || benchmark.active !== true || benchmark.price_update_url || benchmark.source_id) {
  throw new Error(`Refusing unsafe Market Return correction: ${JSON.stringify(benchmark)}`);
}

const prices = await fetch(`${base}/rest/v1/fund_prices?fund_id=eq.${encodeURIComponent(benchmark.fund_id)}&select=id&limit=1`, { headers });
if (!prices.ok) throw new Error(`Market Return price lookup failed: ${prices.status} ${(await prices.text()).slice(0, 500)}`);
if ((await prices.json()).length) throw new Error("Refusing to deactivate Market Return record with price history");

const notes = `${benchmark.notes} EIMA Performance of Egyptian Mutual Funds report dated 14-May-2026 lists Market Return as the EGX30 benchmark (inception Jan-1999, base 1000), not as an investable fund; deactivated from active NAV coverage.`;
const update = await fetch(`${base}/rest/v1/funds?fund_id=eq.${encodeURIComponent(benchmark.fund_id)}`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({ active: false, notes }),
});
if (!update.ok) throw new Error(`Market Return deactivation failed: ${update.status} ${(await update.text()).slice(0, 500)}`);
console.log(JSON.stringify({ deactivated: (await update.json())[0] }, null, 2));
