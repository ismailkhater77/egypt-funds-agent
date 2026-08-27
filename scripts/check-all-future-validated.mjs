const base = process.env.SUPABASE_URL;
import { getEgyptBusinessDate } from "./lib/egyptBusinessDate.mjs";

const asOfDate = getEgyptBusinessDate();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase environment is missing");
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const sourceResponse = await fetch(`${base}/rest/v1/sources?select=source_id,source_name,source_url`, { headers });
if (!sourceResponse.ok) throw new Error(`source lookup ${sourceResponse.status}: ${await sourceResponse.text()}`);
const sources = await sourceResponse.json();
const names = new Map(sources.map((source) => [source.source_id, source]));
const priceResponse = await fetch(`${base}/rest/v1/fund_prices?valuation_date=gt.${asOfDate}&select=id,source_id,fund_id,nav,currency,valuation_date,status,parser_name&order=valuation_date.asc`, { headers });
if (!priceResponse.ok) throw new Error(`price lookup ${priceResponse.status}: ${await priceResponse.text()}`);
const rows = await priceResponse.json();
const grouped = new Map();
for (const row of rows) {
  const source = names.get(row.source_id);
  const key = `${source?.source_name ?? row.source_id}|${row.status}`;
  grouped.set(key, (grouped.get(key) ?? 0) + 1);
}
console.log(JSON.stringify({
  asOfDate,
  futureRows: rows.length,
  futureValidatedRows: rows.filter((row) => row.status === "validated").length,
  grouped: Object.fromEntries(grouped),
  futureValidated: rows.filter((row) => row.status === "validated"),
}, null, 2));
