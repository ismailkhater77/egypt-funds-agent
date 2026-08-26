const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const get = async (table, query) => { const r = await fetch(`${base}/rest/v1/${table}?${query}`, { headers }); if (!r.ok) throw new Error(await r.text()); return r.json(); };
const funds = await get('funds', 'select=fund_id,canonical_name,eima_name_raw,management_company_raw&canonical_name=ilike.*Target*Maturity*2027*USD*');
const prices = [];
for (const fund of funds) prices.push({ fund, prices: await get('fund_prices', `select=id,nav,valuation_date,status,source_id,parser_name&fund_id=eq.${encodeURIComponent(fund.fund_id)}&order=valuation_date.desc`) });
console.log(JSON.stringify(prices, null, 2));
