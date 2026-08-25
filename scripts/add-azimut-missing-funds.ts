import { createHash } from "node:crypto";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
const sourceUrl = "https://azimut.eg/funds";
const wanted = new Set([
  "AZ – استحقاق  T33 USD",
  "Brassbell",
  "az- استحقاق T25 USD",
  "az- استحقاق  T27 USD",
  "az- استحقاق T25 EGP",
]);
const apiResponse = await fetch("https://app.azimut.eg/api/fund/list?size=100&web=true");
if (!apiResponse.ok) throw new Error(`Azimut API failed: ${apiResponse.status}`);
const api = await apiResponse.json();
const records = (api?.response?.funds?.dataList ?? []).filter((r: { name?: string }) => wanted.has(r.name ?? ""));
if (records.length !== wanted.size) throw new Error(`Expected ${wanted.size} official records, got ${records.length}`);
const sourceResponse = await fetch(`${baseUrl}/rest/v1/sources?select=source_id&source_url=eq.${encodeURIComponent(sourceUrl)}`, { headers });
if (!sourceResponse.ok) throw new Error(`Source lookup failed: ${sourceResponse.status}`);
const sourceRows = await sourceResponse.json();
const sourceId = sourceRows[0]?.source_id;
if (!sourceId) throw new Error("Azimut source mapping is missing");
const fundResponse = await fetch(`${baseUrl}/rest/v1/funds?select=canonical_name&price_update_url=eq.${encodeURIComponent(sourceUrl)}&limit=500`, { headers });
if (!fundResponse.ok) throw new Error(`Fund lookup failed: ${fundResponse.status}`);
const existing = new Set((await fundResponse.json()).map((r: { canonical_name: string }) => r.canonical_name));
const rows = records.filter((r: { name: string }) => !existing.has(r.name)).map((r: { id: number; name: string; asset?: { name?: string }; currency?: { symbol?: string } }) => ({
  fund_id: `fund_azimut_${createHash("sha256").update(String(r.id)).digest("hex").slice(0, 16)}`,
  canonical_name: r.name,
  eima_name_raw: r.name,
  management_company_raw: "Azimut Egypt Asset Management",
  category: r.asset?.name ?? null,
  confidence: 0.8,
  price_update_url: sourceUrl,
  fund_info_url: sourceUrl,
  source_id: sourceId,
  notes: "Added from official Azimut API because the current fund mapping did not contain this official fund.",
  active: true,
}));
if (rows.length) {
  const insert = await fetch(`${baseUrl}/rest/v1/funds`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(rows) });
  if (!insert.ok) throw new Error(`Fund insert failed: ${insert.status} ${await insert.text()}`);
}
console.log(JSON.stringify({ official: records.length, existing: records.length - rows.length, inserted: rows.length, names: rows.map((r: { canonical_name: string }) => r.canonical_name) }, null, 2));
