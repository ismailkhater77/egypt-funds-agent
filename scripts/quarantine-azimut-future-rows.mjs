const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase environment is missing");
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const sourceUrl = "https://azimut.eg/funds";
const sourceResponse = await fetch(`${base}/rest/v1/sources?source_url=eq.${encodeURIComponent(sourceUrl)}&select=source_id&limit=1`, { headers });
if (!sourceResponse.ok) throw new Error(`source lookup ${sourceResponse.status}: ${await sourceResponse.text()}`);
const sourceId = (await sourceResponse.json())[0]?.source_id;
if (!sourceId) throw new Error("Azimut source not found");
const query = `${base}/rest/v1/fund_prices?source_id=eq.${encodeURIComponent(sourceId)}&valuation_date=gt.2026-08-26&status=eq.validated&select=id,raw_payload,valuation_date`;
const response = await fetch(query, { headers });
if (!response.ok) throw new Error(`future lookup ${response.status}: ${await response.text()}`);
const rows = await response.json();
for (const row of rows) {
  const rawData = row.raw_payload && typeof row.raw_payload === "object" ? row.raw_payload : {};
  const patch = await fetch(`${base}/rest/v1/fund_prices?id=eq.${encodeURIComponent(row.id)}`, { method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ raw_payload: { ...rawData, validation_state: "rejected_future_date", validation_note: "Valuation date was in the future relative to 2026-08-26; excluded by as_of_date coverage filter." } }) });
  if (!patch.ok) throw new Error(`patch ${row.id} ${patch.status}: ${await patch.text()}`);
}
console.log(JSON.stringify({ sourceId, quarantined: rows.length, ids: rows.map(row => row.id) }, null, 2));
