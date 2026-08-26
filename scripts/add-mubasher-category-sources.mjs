const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
const article = (id, slug) => `https://mubasherfunds.info/${id}/article/${encodeURIComponent(slug)}`;
const common = "-25-أغسطس-2026";
const sources = [
  { source_id: "src_mubasher_daily_real_estate_2026_08_25", source_name: "Mubasher Funds Real Estate Prices 25 Aug 2026", source_url: article(8481, `أسعار-وثائق-صناديق-الاستثمار-في-الأسهم-العقارية${common}`), source_kind: "affiliated_publication_fund_rates", active: true },
  { source_id: "src_mubasher_daily_fixed_income_2026_08_25", source_name: "Mubasher Funds Fixed Income Prices 25 Aug 2026", source_url: article(8482, `أسعار-وثائق-صناديق-الاستثمار-النقدية-والدخل-الثابت${common}`), source_kind: "affiliated_publication_fund_rates", active: true },
  { source_id: "src_mubasher_daily_equity_2026_08_25", source_name: "Mubasher Funds Equity Prices 25 Aug 2026", source_url: article(8483, `أسعار-وثائق-صناديق-الاستثمار-في-الأسهم${common}`), source_kind: "affiliated_publication_fund_rates", active: true },
  { source_id: "src_mubasher_daily_dollar_2026_08_25", source_name: "Mubasher Funds Dollar Prices 25 Aug 2026", source_url: article(8484, `أسعار-وثائق-صناديق-الاستثمار-الدولارية${common}`), source_kind: "affiliated_publication_fund_rates", active: true },
  { source_id: "src_mubasher_daily_islamic_2026_08_25", source_name: "Mubasher Funds Islamic Prices 25 Aug 2026", source_url: article(8487, `أسعار-وثائق-صناديق-الاستثمار-الإسلامية${common}`), source_kind: "affiliated_publication_fund_rates", active: true },
];
const response = await fetch(`${baseUrl}/rest/v1/sources?on_conflict=source_url`, { method: "POST", headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(sources) });
if (!response.ok) throw new Error(`source upsert ${response.status}: ${(await response.text()).slice(0, 500)}`);
console.log(JSON.stringify(await response.json(), null, 2));
