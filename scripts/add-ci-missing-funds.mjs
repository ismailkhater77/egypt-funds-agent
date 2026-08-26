import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { parseCiCapitalFunds } from "../server/efgCollector.ts";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const sourceUrl = "https://www.cicapital.com/fundprice/";
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
const officialHtml = await fs.readFile(new URL("../server/fixtures/ci-fundprice.html", import.meta.url), "utf8");
const wanted = new Set(["Banque Misr Money Market Fund (EUR)", "PBD & Banque du Caire (Al Wefak)"]);
const records = parseCiCapitalFunds(officialHtml).filter((record) => wanted.has(record.name));
if (records.length !== wanted.size) throw new Error(`Expected ${wanted.size} official records, got ${records.length}`);
const sourceResponse = await fetch(`${baseUrl}/rest/v1/sources?select=source_id&source_url=eq.${encodeURIComponent(sourceUrl)}&limit=1`, { headers });
if (!sourceResponse.ok) throw new Error(`CI source lookup failed: ${sourceResponse.status}`);
const sourceId = (await sourceResponse.json())[0]?.source_id;
if (!sourceId) throw new Error("CI source mapping is missing");
const existingResponse = await fetch(`${baseUrl}/rest/v1/funds?select=canonical_name&price_update_url=eq.${encodeURIComponent(sourceUrl)}&limit=500`, { headers });
if (!existingResponse.ok) throw new Error(`CI fund lookup failed: ${existingResponse.status}`);
const existing = new Set((await existingResponse.json()).map((row) => row.canonical_name));
const rows = records.filter((record) => !existing.has(record.name)).map((record) => ({
  fund_id: `fund_ci_${createHash("sha256").update(record.name).digest("hex").slice(0, 16)}`,
  canonical_name: record.name,
  eima_name_raw: record.name,
  management_company_raw: "CI Capital Asset Management",
  category: null,
  confidence: 0.9,
  price_update_url: sourceUrl,
  fund_info_url: sourceUrl,
  source_id: sourceId,
  notes: "Added from the official CI Capital Fund Price table because the current mapping did not contain this official row.",
  active: true,
}));
if (rows.length) {
  const insertResponse = await fetch(`${baseUrl}/rest/v1/funds`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(rows) });
  if (!insertResponse.ok) throw new Error(`CI fund insert failed: ${insertResponse.status} ${await insertResponse.text()}`);
}
console.log(JSON.stringify({ official: records.length, existing: records.length - rows.length, inserted: rows.length, names: rows.map((row) => row.canonical_name) }, null, 2));
