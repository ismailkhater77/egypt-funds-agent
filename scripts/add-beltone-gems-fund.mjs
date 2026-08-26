import { createHash } from 'node:crypto';
const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const sourceUrl = 'https://www.beltoneholding.com/business-line/asset-management-1';
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
const sourceResponse = await fetch(`${baseUrl}/rest/v1/sources?select=source_id&source_url=eq.${encodeURIComponent(sourceUrl)}&limit=1`, { headers });
if (!sourceResponse.ok) throw new Error(`Beltone source lookup failed: ${sourceResponse.status}`);
const sourceId = (await sourceResponse.json())[0]?.source_id;
if (!sourceId) throw new Error('Beltone source mapping is missing');
const name = 'Beltone Gems Equity Fund- USD';
const lookup = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&or=(canonical_name.ilike.*Gems*,eima_name_raw.ilike.*Gems*)&limit=50`, { headers });
if (!lookup.ok) throw new Error(`fund lookup failed: ${lookup.status}`);
const existing = await lookup.json();
if (existing.length === 0) {
  const row = { fund_id: `fund_beltone_${createHash('sha256').update(name).digest('hex').slice(0, 16)}`, canonical_name: name, eima_name_raw: name, management_company_raw: 'Beltone Asset Management', category: null, confidence: 0.9, price_update_url: sourceUrl, fund_info_url: sourceUrl, source_id: sourceId, notes: 'Added from the official Beltone price sheet after confirming the published row was not represented in the catalog.', active: true };
  const insert = await fetch(`${baseUrl}/rest/v1/funds`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(row) });
  if (!insert.ok) throw new Error(`fund insert failed: ${insert.status} ${(await insert.text()).slice(0, 300)}`);
  console.log(JSON.stringify({ inserted: true, name }, null, 2));
} else {
  console.log(JSON.stringify({ inserted: false, existing }, null, 2));
}
