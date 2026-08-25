const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const url = `${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&price_update_url=eq.${encodeURIComponent("https://www.beltoneholding.com/business-line/asset-management-1")}&limit=500`;
const response = await fetch(url, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
console.log(JSON.stringify(await response.json(), null, 2));
