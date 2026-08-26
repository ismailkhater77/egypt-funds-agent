const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Supabase server configuration is missing");

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const eimaReport = "http://eima.org.eg/wp-content/uploads/2026/05/Performance-14-May-2026-Time-Weighted.pdf";
const expected = [
  {
    canonicalName: "Blom Bank Fund I",
    category: "Open End- Equity Funds",
    note: `EIMA's 14-May-2026 performance report identifies this historical fund as an open-end equity fund managed by CFH Asset Management, inception Jul-2009, with a stale report NAV of 545.72 EGP. The NAV is not persisted. FRA successor record 669271 identifies a former BLOM cumulative fund, but no current dated NAV is published. EIMA evidence: ${eimaReport}`,
  },
  {
    canonicalName: "Blom Bank Fund II",
    category: "Open End- Money Market Funds",
    note: `EIMA's 14-May-2026 performance report identifies this historical fund as an open-end money-market fund managed by CFH Asset Management, inception Sep-2009, with a stale report NAV of 700.57 EGP. The NAV is not persisted. FRA successor record 669306 identifies a former BLOM money-market fund, but no current dated NAV is published. EIMA evidence: ${eimaReport}`,
  },
];

for (const item of expected) {
  const query = new URLSearchParams({
    select: "fund_id,canonical_name,eima_name_raw,management_company_raw,category,confidence,notes,active,price_update_url,source_id",
    canonical_name: `eq.${item.canonicalName}`,
    limit: "2",
  });
  const lookup = await fetch(`${base}/rest/v1/funds?${query}`, { headers });
  if (!lookup.ok) throw new Error(`BLOM lookup failed: ${lookup.status} ${(await lookup.text()).slice(0, 500)}`);
  const rows = await lookup.json();
  if (rows.length !== 1) throw new Error(`Expected one ${item.canonicalName} record; found ${rows.length}`);
  const fund = rows[0];
  if (fund.eima_name_raw !== item.canonicalName || fund.management_company_raw !== "CFH Asset Management" || fund.category !== null || fund.active !== true || fund.price_update_url !== null || fund.source_id !== null) {
    throw new Error(`Refusing unsafe ${item.canonicalName} enrichment: ${JSON.stringify(fund)}`);
  }
  const update = await fetch(`${base}/rest/v1/funds?fund_id=eq.${encodeURIComponent(fund.fund_id)}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ category: item.category, notes: `${fund.notes} ${item.note}` }),
  });
  if (!update.ok) throw new Error(`BLOM enrichment failed: ${update.status} ${(await update.text()).slice(0, 500)}`);
  console.log(JSON.stringify({ enriched: (await update.json())[0] }, null, 2));
}
