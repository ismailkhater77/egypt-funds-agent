const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const canonicalName = "Zaldi Star Equity";
const officialUrl = "https://zaldi-capital.com/zaldi-star/";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const query = new URLSearchParams({
  select: "fund_id,canonical_name,eima_name_raw,management_company_raw,category,confidence,notes,active,price_update_url,source_id",
  canonical_name: `eq.${canonicalName}`,
  limit: "2",
});
const lookup = await fetch(`${base}/rest/v1/funds?${query}`, { headers });
if (!lookup.ok) throw new Error(`Zaldi lookup failed: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
const rows = await lookup.json();
if (rows.length !== 1) throw new Error(`Expected one Zaldi Star catalog record; found ${rows.length}`);
const fund = rows[0];
if (fund.eima_name_raw !== "Zaldi Star Equity" || fund.management_company_raw !== "Zaldi Investments" || fund.category !== "Open End- Equity Funds" || fund.active !== true || fund.price_update_url !== "https://zaldi-capital.com/" || !fund.source_id) {
  throw new Error(`Refusing unsafe Zaldi correction: ${JSON.stringify(fund)}`);
}

const notes = `${fund.notes} Corrected against FRA company record 669776 and Zaldi's first-party page: legal product is ZALDI STAR, a money-market fund; the imported equity label is retained in eima_name_raw.`;
const update = await fetch(`${base}/rest/v1/funds?fund_id=eq.${encodeURIComponent(fund.fund_id)}`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({
    canonical_name: "Zaldi Star (Money Market)",
    category: "Open End- Money Market Funds",
    price_update_url: officialUrl,
    notes,
  }),
});
if (!update.ok) throw new Error(`Zaldi correction failed: ${update.status} ${(await update.text()).slice(0, 500)}`);
console.log(JSON.stringify({ corrected: (await update.json())[0] }, null, 2));
