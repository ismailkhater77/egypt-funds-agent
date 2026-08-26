const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Missing Supabase configuration");
const params = new URLSearchParams({
  select: "fund_id,canonical_name,eima_name_raw,price_update_url,category",
  limit: "500",
});
const response = await fetch(`${baseUrl}/rest/v1/funds?${params}`, {
  headers: { apikey: secret, Authorization: `Bearer ${secret}` },
});
if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
const funds = await response.json();
const terms = ["pharos", "فاروس", "aton", "aton pharos"];
for (const fund of funds) {
  const haystack = `${fund.canonical_name ?? ""} ${fund.eima_name_raw ?? ""}`.toLowerCase();
  if (terms.some((term) => haystack.includes(term.toLowerCase()))) console.log(JSON.stringify(fund));
}
