import { runBdcAlWefakCollector } from "../server/efgCollector.ts";

const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const source = {
  source_id: "src_banque_du_caire_al_wefak",
  source_name: "Banque du Caire Al Wefak Fund Pricing",
  source_url: "https://www.bdc.com.eg/bdcwebsite/ar/personal/funds/bdc-funds-pricing.html",
  source_kind: "official_bank_fund_rates",
  active: true,
};
const response = await fetch(`${base}/rest/v1/sources?on_conflict=source_id`, {
  method: "POST",
  headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify([source]),
});
if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
console.log(JSON.stringify(await runBdcAlWefakCollector(), null, 2));
