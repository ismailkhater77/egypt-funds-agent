const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const canonicalName = "Sigma Traded Fund";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const query = new URLSearchParams({
  select: "fund_id,canonical_name,eima_name_raw,management_company_raw,active,price_update_url,source_id,notes",
  canonical_name: `eq.${canonicalName}`,
  limit: "2",
});
const lookup = await fetch(`${base}/rest/v1/funds?${query}`, { headers });
if (!lookup.ok) throw new Error(`Sigma lookup failed: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
const rows = await lookup.json();
if (rows.length !== 1) throw new Error(`Expected one Sigma catalog record; found ${rows.length}`);
const sigma = rows[0];
if (sigma.eima_name_raw !== canonicalName || sigma.management_company_raw !== "Sigma Funds Management" || sigma.active !== true || sigma.price_update_url || sigma.source_id) {
  throw new Error(`Refusing unsafe Sigma correction: ${JSON.stringify(sigma)}`);
}

const prices = await fetch(`${base}/rest/v1/fund_prices?fund_id=eq.${encodeURIComponent(sigma.fund_id)}&select=id&limit=1`, { headers });
if (!prices.ok) throw new Error(`Sigma price lookup failed: ${prices.status} ${(await prices.text()).slice(0, 500)}`);
if ((await prices.json()).length) throw new Error("Refusing to deactivate Sigma record with price history");

const notes = `${sigma.notes} FRA company-register evidence: this is a fund-management company (currently Beltone Investment Funds), not an investable fund; deactivated from active NAV coverage.`;
const update = await fetch(`${base}/rest/v1/funds?fund_id=eq.${encodeURIComponent(sigma.fund_id)}`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({ active: false, notes }),
});
if (!update.ok) throw new Error(`Sigma deactivation failed: ${update.status} ${(await update.text()).slice(0, 500)}`);
console.log(JSON.stringify({ deactivated: (await update.json())[0] }, null, 2));
