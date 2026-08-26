const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase environment is missing");
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const sourceResponse = await fetch(`${base}/rest/v1/sources?source_url=eq.${encodeURIComponent("https://azimut.eg/funds")}&select=source_id&limit=1`, { headers });
if (!sourceResponse.ok) throw new Error(`source lookup ${sourceResponse.status}: ${await sourceResponse.text()}`);
const sources = await sourceResponse.json();
const sourceId = sources[0]?.source_id;
if (!sourceId) { console.log(JSON.stringify({ sourceId: null, rows: [] }, null, 2)); process.exit(0); }
const url = `${base}/rest/v1/fund_prices?source_id=eq.${encodeURIComponent(sourceId)}&valuation_date=gt.2026-08-26&select=id,fund_id,nav,currency,valuation_date,status&order=valuation_date.asc`;
const response = await fetch(url, { headers });
if (!response.ok) throw new Error(`price lookup ${response.status}: ${await response.text()}`);
console.log(JSON.stringify({ sourceId, rows: await response.json() }, null, 2));
