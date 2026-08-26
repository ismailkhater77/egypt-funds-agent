const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const response = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&limit=500`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
if (!response.ok) throw new Error(`fund read ${response.status}: ${(await response.text()).slice(0, 300)}`);
const funds = await response.json();
const terms = process.argv.slice(2).map((x) => x.toLowerCase());
for (const term of terms) {
  console.log(`\nTERM ${term}`);
  for (const fund of funds.filter((f) => `${f.canonical_name} ${f.eima_name_raw ?? ""}`.toLowerCase().includes(term))) console.log(JSON.stringify(fund));
}
