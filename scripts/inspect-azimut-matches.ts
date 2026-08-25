import { normalize, parseAzimutFunds } from "../server/efgCollector";

const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const sourceUrl = "https://azimut.eg/funds";
const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
const fundsResponse = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&price_update_url=eq.${encodeURIComponent(sourceUrl)}&limit=500`, { headers });
if (!fundsResponse.ok) throw new Error(`funds query failed: ${fundsResponse.status}`);
const mapped = await fundsResponse.json();
const apiResponse = await fetch("https://app.azimut.eg/api/fund/list?size=100&web=true");
if (!apiResponse.ok) throw new Error(`Azimut API failed: ${apiResponse.status}`);
const records = await parseAzimutFunds(await apiResponse.text());
console.log(JSON.stringify({ mappedCount: mapped.length, extractedCount: records.length, mapped, extracted: records.map((r) => ({ name: r.name, normalized: normalize(r.name) })) }, null, 2));
