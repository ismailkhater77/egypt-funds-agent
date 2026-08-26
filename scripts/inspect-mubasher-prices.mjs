const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const params = new URLSearchParams({ select: 'id,fund_id,nav,currency,valuation_date,status,raw_name,source_id', source_id: 'eq.src_mubasherfunds_daily', order: 'valuation_date.desc' });
const response = await fetch(`${baseUrl}/rest/v1/fund_prices?${params}`, { headers });
if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 500)}`);
console.log(JSON.stringify(await response.json(), null, 2));
