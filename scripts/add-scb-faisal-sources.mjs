const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error('Supabase server configuration is missing');
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
const sources = [
  { source_id: 'src_scb_fund_rates', source_name: 'Suez Canal Bank Fund Rates', source_url: 'https://scbank.com.eg/Ar/Fund_Rates.aspx', source_kind: 'official_bank_fund_rates', active: true },
  { source_id: 'src_faisal_mutual_funds', source_name: 'Faisal Islamic Bank Mutual Funds', source_url: 'https://www.faisalbank.com.eg/ar/Retail/Mutual-Funds', source_kind: 'official_bank_fund_rates', active: true },
  { source_id: 'src_nbk_ishraq', source_name: 'NBK Egypt Ishraq Fund', source_url: 'https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/ishraq.html', source_kind: 'official_bank_fund_rates', active: true },
  { source_id: 'src_nbk_namaa', source_name: 'NBK Egypt Namaa Fund', source_url: 'https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/namaa.html', source_kind: 'official_bank_fund_rates', active: true },
  { source_id: 'src_nbk_al_hayah', source_name: 'NBK Egypt Al-Hayah Fund', source_url: 'https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/al-hayah.html', source_kind: 'official_bank_fund_rates', active: true },
  { source_id: 'src_nbk_mizan', source_name: 'NBK Egypt Al-Mizan Fund', source_url: 'https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/mizan.html', source_kind: 'official_bank_fund_rates', active: true },
  { source_id: 'src_pfi_funds', source_name: 'PFI Asset Management Funds', source_url: 'https://pfi-am.com.eg/funds/', source_kind: 'official_asset_manager_fund_rates', active: true },
];
const response = await fetch(`${baseUrl}/rest/v1/sources?on_conflict=source_url`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(sources) });
if (!response.ok) throw new Error(`source upsert ${response.status}: ${(await response.text()).slice(0, 500)}`);
const rows = await response.json();
console.log(JSON.stringify(rows, null, 2));
