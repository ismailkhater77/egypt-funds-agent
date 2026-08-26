const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const source = {
  source_id: "src_abk_egypt_money_market",
  source_name: "ABK Egypt Official Money Market Fund Page",
  source_url: "https://www.abkegypt.com/Business/Treasury/Investments/Money-Market-Fund?r=2",
  source_kind: "official_bank_fund_rates",
  active: true,
};
const canonicalName = "Al Ahli Bank of Kuwait - Egypt Fund II";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const sourceResponse = await fetch(`${base}/rest/v1/sources?on_conflict=source_url`, {
  method: "POST",
  headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify(source),
});
if (!sourceResponse.ok) throw new Error(`ABK source upsert failed: ${sourceResponse.status} ${(await sourceResponse.text()).slice(0, 500)}`);

const lookup = await fetch(`${base}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,management_company_raw,active,price_update_url,source_id,notes&canonical_name=eq.${encodeURIComponent(canonicalName)}&limit=2`, { headers });
if (!lookup.ok) throw new Error(`ABK Fund II lookup failed: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
const rows = await lookup.json();
if (rows.length !== 1) throw new Error(`Expected one ABK Fund II record; found ${rows.length}`);
const fund = rows[0];
if (fund.eima_name_raw !== canonicalName || fund.management_company_raw !== "Sigma Asset Management" || fund.active !== true || fund.price_update_url || fund.source_id) {
  throw new Error(`Refusing unsafe ABK Fund II source link: ${JSON.stringify(fund)}`);
}

const identityNote = "Official ABK Money Market Fund page confirms daily liquidity, Sigma Asset Management, May-2009 inception, and EGP 10 nominal value; these match EIMA’s ABK Egypt Fund II identity."
const update = await fetch(`${base}/rest/v1/funds?fund_id=eq.${encodeURIComponent(fund.fund_id)}`, {
  method: "PATCH",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({ source_id: source.source_id, price_update_url: source.source_url, notes: `${fund.notes} ${identityNote}` }),
});
if (!update.ok) throw new Error(`ABK Fund II link failed: ${update.status} ${(await update.text()).slice(0, 500)}`);

console.log(JSON.stringify({ source: await sourceResponse.json(), linkedFund: (await update.json())[0] }, null, 2));
