const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const response = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&limit=1000`, { headers });
if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 500)}`);
const rows = await response.json();
const normalize = (value) => (value ?? '').normalize('NFKC').toLowerCase().replace(/[()\[\]{}.,:;\/\\"'“”‘’*&-]/g, ' ').replace(/\s+/g, ' ').trim();
const groups = new Map();
for (const row of rows) {
  const key = normalize(row.canonical_name);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}
const duplicates = [...groups.entries()].filter(([, items]) => items.length > 1).map(([normalized_name, items]) => ({ normalized_name, items }));
console.log(JSON.stringify({ totalFunds: rows.length, duplicateGroups: duplicates.length, duplicates }, null, 2));
if (duplicates.length) process.exitCode = 2;
