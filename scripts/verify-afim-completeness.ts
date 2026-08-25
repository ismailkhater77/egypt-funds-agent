import { normalize, parseAfimFunds } from "../server/efgCollector";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const sourceUrl = "https://www.afim.com.eg/public/index.php/investment";
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const fundsResponse = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&price_update_url=eq.${encodeURIComponent(sourceUrl)}&limit=500`, { headers });
if (!fundsResponse.ok) throw new Error(`funds query failed: ${fundsResponse.status}`);
const mappedFunds = await fundsResponse.json() as Array<{ fund_id: string; canonical_name: string; eima_name_raw: string | null }>;
const listingResponse = await fetch(sourceUrl, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
if (!listingResponse.ok) throw new Error(`AFIM listing returned HTTP ${listingResponse.status}`);
const records = await parseAfimFunds(await listingResponse.text());
const sourceNames = new Set(records.map((record) => normalize(record.name)));
const missing = mappedFunds.filter((fund) => !sourceNames.has(normalize(fund.eima_name_raw)) && !sourceNames.has(normalize(fund.canonical_name)));
console.log(JSON.stringify({ mappedCount: mappedFunds.length, extractedCount: records.length, missingCount: missing.length, missing: missing.map((fund) => ({ fund_id: fund.fund_id, canonical_name: fund.canonical_name, eima_name_raw: fund.eima_name_raw })) }, null, 2));
if (missing.length) process.exit(1);
