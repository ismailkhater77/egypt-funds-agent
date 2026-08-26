const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const response = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,price_update_url&limit=500`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
const funds = await response.json();
for (const term of ["siula", "horus", "aafaq", "gig", "edkhar", "weladna", "misr insurance", "target first", "mubasher", "kash", "cash"]) {
  console.log(`\nTERM ${term}`);
  for (const f of funds.filter((x) => `${x.canonical_name} ${x.eima_name_raw ?? ""}`.toLowerCase().includes(term))) console.log(JSON.stringify(f));
}
