const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const params = new URLSearchParams({ select: 'fund_id,canonical_name,eima_name_raw,management_company_raw,price_update_url,source_id', limit: '500' });
const response = await fetch(`${baseUrl}/rest/v1/funds?${params}`, { headers });
if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 500)}`);
const rows = await response.json();
console.log(JSON.stringify(rows.filter((row) => /ABK|Ahli Bank of Kuwait|Al Ahli Bank of Kuwait|Kuwait/i.test(`${row.canonical_name} ${row.eima_name_raw} ${row.management_company_raw}`)), null, 2));
