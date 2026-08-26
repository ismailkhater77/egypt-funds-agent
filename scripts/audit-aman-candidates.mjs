const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function get(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

const funds = await get("funds?select=fund_id,canonical_name,eima_name_raw,management_company_raw,category,price_update_url,source_id,active&or=(canonical_name.ilike.*aman*,eima_name_raw.ilike.*aman*,canonical_name.ilike.*امان*,eima_name_raw.ilike.*امان*)&limit=50");
const fundIds = funds.map((fund) => fund.fund_id);
const prices = fundIds.length ? await get(`fund_prices?select=fund_id,source_id,nav,currency,valuation_date,status&fund_id=in.(${fundIds.join(",")})&order=valuation_date.desc&limit=200`) : [];
console.log(JSON.stringify({ funds, prices }, null, 2));
