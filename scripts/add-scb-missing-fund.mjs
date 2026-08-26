const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
const fund = {
  fund_id: 'fund_catalog_scb_arabia_misr_insurance',
  canonical_name: 'صندوق استثمار العربية المصرية للتأمين',
  eima_name_raw: 'Arabia Egypt Insurance Investment Fund',
  management_company_raw: 'Arabia Egypt Insurance',
  category: 'investment_fund',
  confidence: 0.95,
  price_update_url: null,
  fund_info_url: 'https://scbank.com.eg/Ar/Fund_Rates.aspx',
  source_id: null,
  notes: 'Cataloged from official Suez Canal Bank fund-rate page; source is secondary until an independent manager/EIMA identity is confirmed.',
  active: true,
};
const response = await fetch(`${baseUrl}/rest/v1/funds?on_conflict=fund_id`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(fund) });
if (!response.ok) throw new Error(`fund upsert ${response.status}: ${(await response.text()).slice(0, 500)}`);
console.log(JSON.stringify(await response.json(), null, 2));
