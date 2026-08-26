const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const source = {
  source_id: "src_fab_misr_al_awal",
  source_name: "FABMISR Official Al Awal Fund Page",
  source_url: "https://www.fabmisr.com.eg/en/personal-banking/investments-funds/al-awal-fund",
  source_kind: "official_bank_fund_rates",
  active: true,
};
const canonicalName = "FABMISR (Al Awal) Daily Cumulative Return Fund for Liquidity";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const sourceResponse = await fetch(`${base}/rest/v1/sources?on_conflict=source_url`, {
  method: "POST",
  headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify(source),
});
if (!sourceResponse.ok) throw new Error(`FABMISR Al Awal source upsert failed: ${sourceResponse.status} ${(await sourceResponse.text()).slice(0, 500)}`);

const lookup = await fetch(`${base}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,management_company_raw,category,active,price_update_url,source_id&canonical_name=eq.${encodeURIComponent(canonicalName)}&limit=2`, { headers });
if (!lookup.ok) throw new Error(`FABMISR Al Awal lookup failed: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
const rows = await lookup.json();
if (rows.length !== 1) throw new Error(`Expected one FABMISR Al Awal record; found ${rows.length}`);
const fund = rows[0];
if (fund.eima_name_raw !== "Fab Misr (Al Awal)" || fund.management_company_raw !== "HC Securities & Investment" || fund.category !== "Open End- Money Market Funds" || fund.active !== true || fund.price_update_url !== "https://www.hc-si.com/Service/asset-management#funds") {
  throw new Error(`Refusing unsafe FABMISR Al Awal secondary-source setup: ${JSON.stringify(fund)}`);
}

console.log(JSON.stringify({ source: await sourceResponse.json(), verifiedFund: fund, preservedCatalogSource: fund.price_update_url }, null, 2));
