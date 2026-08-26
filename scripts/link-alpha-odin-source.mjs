const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");

const sourceUrl = "https://alpha-odin.com/";
const source = {
  source_id: "src_alpha_odin_homepage",
  source_name: "Alpha Odin Official Fund Cards",
  source_url: sourceUrl,
  source_kind: "official_asset_manager_fund_rates",
  active: true,
};
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };

const sourceResponse = await fetch(`${baseUrl}/rest/v1/sources?on_conflict=source_url`, {
  method: "POST",
  headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify(source),
});
if (!sourceResponse.ok) throw new Error(`Source upsert failed: ${sourceResponse.status} ${(await sourceResponse.text()).slice(0, 500)}`);

const wantedNames = ["Odin Trend", "Egyptian Arab Land Bank Fund (Al Masry)"];
const results = [];
for (const canonicalName of wantedNames) {
  const lookup = await fetch(`${baseUrl}/rest/v1/funds?select=fund_id,canonical_name&canonical_name=eq.${encodeURIComponent(canonicalName)}&limit=2`, { headers });
  if (!lookup.ok) throw new Error(`Fund lookup failed for ${canonicalName}: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
  const rows = await lookup.json();
  if (rows.length !== 1) throw new Error(`Expected exactly one catalog fund for ${canonicalName}; found ${rows.length}`);

  const update = await fetch(`${baseUrl}/rest/v1/funds?fund_id=eq.${encodeURIComponent(rows[0].fund_id)}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ source_id: source.source_id, price_update_url: sourceUrl }),
  });
  if (!update.ok) throw new Error(`Fund source link failed for ${canonicalName}: ${update.status} ${(await update.text()).slice(0, 500)}`);
  results.push(...await update.json());
}

console.log(JSON.stringify({ source: await sourceResponse.json(), linkedFunds: results }, null, 2));
