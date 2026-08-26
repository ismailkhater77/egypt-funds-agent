const canonicalName = process.argv[2];
if (!canonicalName) throw new Error("Usage: node scripts/inspect-catalog-record.mjs <canonical name>");
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const params = new URLSearchParams({
  select: "fund_id,canonical_name,eima_name_raw,management_company_raw,category,confidence,notes,active,price_update_url,source_id",
  canonical_name: `eq.${canonicalName}`,
  limit: "2",
});
const response = await fetch(`${base}/rest/v1/funds?${params}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
if (!response.ok) throw new Error(`Fund lookup failed: ${response.status} ${(await response.text()).slice(0, 500)}`);
console.log(JSON.stringify(await response.json(), null, 2));
