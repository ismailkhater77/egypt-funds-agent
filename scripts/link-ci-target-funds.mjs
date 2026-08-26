const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
const sourceUrl = 'https://www.cicapital.com/fundprice/';
for (const canonicalName of ['Menthum', 'Misr Money Market (Euro)']) {
  const filter = encodeURIComponent(canonicalName);
  const response = await fetch(`${baseUrl}/rest/v1/funds?canonical_name=eq.${filter}`, { method: 'PATCH', headers, body: JSON.stringify({ price_update_url: sourceUrl }) });
  if (!response.ok) throw new Error(`${canonicalName}: ${response.status} ${(await response.text()).slice(0, 500)}`);
  console.log(canonicalName, JSON.stringify(await response.json()));
}
