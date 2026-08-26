const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const params = new URLSearchParams({ select: 'fund_id,canonical_name,eima_name_raw,management_company_raw,source_id,price_update_url', limit: '1000' });
const response = await fetch(`${baseUrl}/rest/v1/funds?${params}`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 500)}`);
const rows = await response.json();
const hits = rows.filter((row) => /adib|gems|جيم|إسلام/i.test(`${row.canonical_name} ${row.eima_name_raw ?? ''} ${row.management_company_raw ?? ''}`));
console.log(JSON.stringify(hits, null, 2));
