const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
const sourceUrl = 'https://mubasherfunds.info/';
const source = {
  source_id: 'src_mubasherfunds_daily',
  source_name: 'mubasherfunds.info',
  source_url: sourceUrl,
  source_kind: 'daily_fund_price_publication',
  active: true,
};
let response = await fetch(`${baseUrl}/rest/v1/sources?on_conflict=source_url`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(source) });
if (!response.ok) throw new Error(`source upsert ${response.status}: ${(await response.text()).slice(0, 500)}`);
const sourceRows = await (await fetch(`${baseUrl}/rest/v1/sources?select=source_id&source_url=eq.${encodeURIComponent(sourceUrl)}&limit=1`, { headers })).json();
const sourceId = sourceRows[0]?.source_id;
if (!sourceId) throw new Error('Mubasher source was not returned after upsert');
const names = ['Mubasher Equity', 'Cash Mubasher', 'Mubasher Gold'];
for (const name of names) {
  const params = `canonical_name=eq.${encodeURIComponent(name)}`;
  response = await fetch(`${baseUrl}/rest/v1/funds?${params}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ source_id: sourceId, price_update_url: sourceUrl }) });
  if (!response.ok) throw new Error(`fund link ${name} ${response.status}: ${(await response.text()).slice(0, 500)}`);
}
console.log(JSON.stringify({ sourceId, linkedFunds: names }, null, 2));
