const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const sourceId = "src_abk_egypt_money_market";
const fromUrl = "https://www.abkegypt.com/Business/Treasury/Investments/Money-Market-Fund";
const toUrl = "https://www.abkegypt.com/Business/Treasury/Investments/Money-Market-Fund?r=2";
const canonicalName = "Al Ahli Bank of Kuwait - Egypt Fund II";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const sourceLookup = await fetch(`${base}/rest/v1/sources?select=source_id,source_url&source_id=eq.${sourceId}&limit=2`, { headers });
if (!sourceLookup.ok) throw new Error(`ABK source lookup failed: ${sourceLookup.status} ${(await sourceLookup.text()).slice(0, 500)}`);
const sources = await sourceLookup.json();
if (sources.length !== 1 || sources[0].source_url !== fromUrl) throw new Error(`Refusing unexpected ABK source migration: ${JSON.stringify(sources)}`);

const fundLookup = await fetch(`${base}/rest/v1/funds?select=fund_id,canonical_name,source_id,price_update_url&canonical_name=eq.${encodeURIComponent(canonicalName)}&limit=2`, { headers });
if (!fundLookup.ok) throw new Error(`ABK fund lookup failed: ${fundLookup.status} ${(await fundLookup.text()).slice(0, 500)}`);
const funds = await fundLookup.json();
if (funds.length !== 1 || funds[0].source_id !== sourceId || funds[0].price_update_url !== fromUrl) throw new Error(`Refusing unexpected ABK fund migration: ${JSON.stringify(funds)}`);

const sourceUpdate = await fetch(`${base}/rest/v1/sources?source_id=eq.${sourceId}`, {
  method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ source_url: toUrl }),
});
if (!sourceUpdate.ok) throw new Error(`ABK source URL migration failed: ${sourceUpdate.status} ${(await sourceUpdate.text()).slice(0, 500)}`);
const fundUpdate = await fetch(`${base}/rest/v1/funds?fund_id=eq.${encodeURIComponent(funds[0].fund_id)}`, {
  method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ price_update_url: toUrl }),
});
if (!fundUpdate.ok) throw new Error(`ABK fund URL migration failed: ${fundUpdate.status} ${(await fundUpdate.text()).slice(0, 500)}`);

console.log(JSON.stringify({ source: (await sourceUpdate.json())[0], fund: (await fundUpdate.json())[0] }, null, 2));
