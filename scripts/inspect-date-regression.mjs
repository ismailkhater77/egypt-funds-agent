const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
  if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
  return response.json();
}
const sourceUrls = {
  Beltone: "https://www.beltoneholding.com/business-line/asset-management-1",
  Azimut: "https://azimut.eg/funds",
  HC: "https://www.hc-si.com/Service/asset-management#funds",
  ZaldiStar: "https://zaldi-capital.com/zaldi-star/",
  ZaldiElmasry: "https://zaldi-capital.com/zaldi-elmasry/",
};
for (const [label, sourceUrl] of Object.entries(sourceUrls)) {
  const fundParams = new URLSearchParams({ select: "fund_id,canonical_name,price_update_url", price_update_url: `eq.${sourceUrl}`, limit: "100" });
  const funds = await get(`/rest/v1/funds?${fundParams}`);
  const sourceParams = new URLSearchParams({ select: "source_id,source_url", source_url: `eq.${sourceUrl}`, limit: "1" });
  const sources = await get(`/rest/v1/sources?${sourceParams}`);
  const sourceId = sources[0]?.source_id;
  console.log(`\n## ${label} funds=${funds.length} source=${sourceId ?? "missing"}`);
  for (const fund of funds) {
    const priceParams = new URLSearchParams({ select: "id,nav,currency,valuation_date,parser_name,collected_at,status", fund_id: `eq.${fund.fund_id}`, order: "valuation_date.desc,collected_at.desc", limit: "10" });
    if (sourceId) priceParams.set("source_id", `eq.${sourceId}`);
    const prices = await get(`/rest/v1/fund_prices?${priceParams}`);
    console.log(JSON.stringify({ fund_id: fund.fund_id, name: fund.canonical_name, prices }));
  }
}
