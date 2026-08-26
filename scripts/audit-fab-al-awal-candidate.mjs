const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function get(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

const candidates = await get("funds?select=fund_id,canonical_name,eima_name_raw,management_company_raw,category,price_update_url,active&or=(canonical_name.ilike.*Awal*,eima_name_raw.ilike.*Awal*,canonical_name.ilike.*اول*,eima_name_raw.ilike.*اول*)&limit=50");
const prices = candidates.length
  ? await get(`fund_prices?select=fund_id,source_id,nav,currency,valuation_date,status,collected_at&fund_id=in.(${candidates.map((candidate) => candidate.fund_id).join(",")})&order=valuation_date.desc&limit=200`)
  : [];

console.log(JSON.stringify({ candidates, prices }, null, 2));
