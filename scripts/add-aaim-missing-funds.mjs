import { createHash } from "node:crypto";
import { parseAaimFunds } from "../server/efgCollector.ts";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const sourceUrl = "https://aaim.com.eg/ar/what-we-offer/funds";
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
const htmlResponse = await fetch("https://aaim.com.eg/en/what-we-offer/funds", { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
if (!htmlResponse.ok) throw new Error(`AAIM source failed: ${htmlResponse.status}`);
const records = parseAaimFunds(await htmlResponse.text()).filter((record) => ["Kenz EGX70 EWI", "Kenz EGX35-LV"].includes(record.name));
if (records.length !== 2) throw new Error(`Expected 2 missing AAIM records, got ${records.length}`);
const sourceResponse = await fetch(`${baseUrl}/rest/v1/sources?select=source_id&source_url=eq.${encodeURIComponent(sourceUrl)}&limit=1`, { headers });
if (!sourceResponse.ok) throw new Error(`AAIM source lookup failed: ${sourceResponse.status}`);
const sourceId = (await sourceResponse.json())[0]?.source_id;
if (!sourceId) throw new Error("AAIM source mapping is missing");
const existingResponse = await fetch(`${baseUrl}/rest/v1/funds?select=canonical_name&price_update_url=eq.${encodeURIComponent(sourceUrl)}&limit=500`, { headers });
if (!existingResponse.ok) throw new Error(`AAIM fund lookup failed: ${existingResponse.status}`);
const existing = new Set((await existingResponse.json()).map((row) => row.canonical_name));
const rows = records.filter((record) => !existing.has(record.name)).map((record) => ({
  fund_id: `fund_aaim_${createHash("sha256").update(record.name).digest("hex").slice(0, 16)}`,
  canonical_name: record.name,
  eima_name_raw: record.name,
  management_company_raw: "Arab African Investment Management",
  category: null,
  confidence: 0.8,
  price_update_url: sourceUrl,
  fund_info_url: "https://aaim.com.eg/en/what-we-offer/funds",
  source_id: sourceId,
  notes: "Added from the official AAIM Funds page because the fund mapping did not contain this official fund.",
  active: true,
}));
if (rows.length) {
  const insertResponse = await fetch(`${baseUrl}/rest/v1/funds`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(rows) });
  if (!insertResponse.ok) throw new Error(`AAIM fund insert failed: ${insertResponse.status} ${await insertResponse.text()}`);
}
console.log(JSON.stringify({ official: records.length, existing: records.length - rows.length, inserted: rows.length, names: rows.map((row) => row.canonical_name) }, null, 2));
