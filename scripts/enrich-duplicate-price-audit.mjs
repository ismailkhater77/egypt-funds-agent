const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const get = async (table, query) => { const r = await fetch(`${base}/rest/v1/${table}?${query}`, { headers }); if (!r.ok) throw new Error(await r.text()); return r.json(); };
const audit = await get("fund_prices", "select=id,fund_id,valuation_date,nav,source_id,parser_name&fund_id=eq.fund_catalog_2a497fc7469ee7ea&valuation_date=eq.2026-08-25");
const fund = await get("funds", "select=fund_id,canonical_name,eima_name_raw,management_company_raw&fund_id=eq.fund_catalog_2a497fc7469ee7ea");
const sourceIds = [...new Set(audit.map(row => row.source_id))].map(id => `source_id.eq.${encodeURIComponent(id)}`).join(",");
const sources = await get("sources", `select=source_id,source_url&or=(${sourceIds})`);
console.log(JSON.stringify({ fund, audit: audit.map(row => ({ ...row, source_url: sources.find(source => source.source_id === row.source_id)?.source_url ?? null })) }, null, 2));
