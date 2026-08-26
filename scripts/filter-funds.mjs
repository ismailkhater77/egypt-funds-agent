const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const url = `${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&limit=500`;
const response = await fetch(url, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
const funds = await response.json();
console.log(JSON.stringify(funds.filter((f) => /egx70|egx35|kenz|kenoz|istsithmar|istithmar|fanar|tameer/i.test(`${f.canonical_name} ${f.eima_name_raw}`)), null, 2));
