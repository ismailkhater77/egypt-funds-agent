const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const response = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&limit=1000`, { headers });
if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 500)}`);
const rows = await response.json();
const normalize = (value) => (value ?? '').normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/[()\[\]{}.,:;\/\\"'“”‘’*&-]/g, ' ').replace(/\s+/g, ' ').trim();
const audit = (field, keyFn) => {
  const groups = new Map();
  for (const row of rows) {
    const value = row[field];
    if (!value) continue;
    const key = keyFn(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ fund_id: row.fund_id, canonical_name: row.canonical_name, eima_name_raw: row.eima_name_raw, value });
  }
  return [...groups.entries()].filter(([, items]) => items.length > 1).map(([key, items]) => ({ key, items }));
};
const canonicalExact = audit('canonical_name', value => value.trim().toLocaleLowerCase('en-US'));
const canonicalNormalized = audit('canonical_name', normalize);
const eimaExact = audit('eima_name_raw', value => value.trim().toLocaleLowerCase('en-US'));
const eimaNormalized = audit('eima_name_raw', normalize);
const crossField = [];
const byKey = new Map();
for (const row of rows) {
  for (const [field, value] of [['canonical_name', row.canonical_name], ['eima_name_raw', row.eima_name_raw]]) {
    if (!value) continue;
    const key = normalize(value);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({ fund_id: row.fund_id, field, value, canonical_name: row.canonical_name, eima_name_raw: row.eima_name_raw });
  }
}
for (const [key, items] of byKey) {
  if (new Set(items.map(item => item.fund_id)).size > 1) crossField.push({ key, items });
}
const result = { totalFunds: rows.length, duplicateGroups: { canonicalExact: canonicalExact.length, canonicalNormalized: canonicalNormalized.length, eimaExact: eimaExact.length, eimaNormalized: eimaNormalized.length, crossField: crossField.length }, duplicates: { canonicalExact, canonicalNormalized, eimaExact, eimaNormalized, crossField } };
console.log(JSON.stringify(result, null, 2));
if (Object.values(result.duplicateGroups).some(count => count > 0)) process.exitCode = 2;
