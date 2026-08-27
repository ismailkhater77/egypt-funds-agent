type FundRow = { fund_id: string; canonical_name: string; category: string | null; price_update_url: string | null };
type FundPriceRow = { fund_id: string; nav: number | string; currency: string; valuation_date: string; source_id: string; collected_at: string; status: string };
type SourceRow = { source_id: string; source_name: string; source_url: string; source_kind: string; active: boolean };
type IndicatorRow = { indicator_key: string; display_name: string; asset_class: string; base_asset: string; quote_currency: string | null; unit: string; canonical_definition: string; primary_source_id: string; provider_symbol: string; source_documentation_url: string; active: boolean };
type MarketRow = { indicator_key: string; source_id: string; source_symbol: string; market_date: string; value: number | string; unit: string; source_observed_at: string | null; fetched_at: string; source_url: string; observation_status: string };
type JobRow = { job_key: string; job_name: string; cron_expression: string | null; active: boolean; last_started_at: string | null; last_finished_at: string | null; last_status: "success" | "partial" | "error" | null; last_run_summary: Record<string, unknown> | null };

export type MarketDashboardSnapshot = {
  asOfDate: string;
  generatedAt: string;
  coverage: { activeFunds: number; coveredFunds: number; uncoveredFunds: number; linkedWithoutSnapshot: number };
  market: Array<MarketRow & { displayName: string; assetClass: string; baseAsset: string; quoteCurrency: string | null; canonicalDefinition: string; sourceName: string | null }>;
  marketSeries: MarketRow[];
  funds: Array<FundRow & { latestNav: number | null; currency: string | null; valuationDate: string | null; sourceName: string | null; collectedAt: string | null; verified: boolean }>;
  sources: Array<SourceRow & { priceCount: number; coveredFundCount: number; latestValuationDate: string | null }>;
  marketJob: JobRow | null;
};

function cairoBusinessDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

async function supabaseRead<T>(path: string): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<T>;
}

export function selectLatestVerifiedFundPrices(rows: FundPriceRow[], asOfDate: string): Map<string, FundPriceRow> {
  const latest = new Map<string, FundPriceRow>();
  for (const row of rows) {
    if (row.status !== "validated" || row.valuation_date > asOfDate) continue;
    const previous = latest.get(row.fund_id);
    if (!previous || row.valuation_date > previous.valuation_date || (row.valuation_date === previous.valuation_date && row.collected_at > previous.collected_at)) latest.set(row.fund_id, row);
  }
  return latest;
}

export function selectLatestMarketObservations(rows: MarketRow[]): Map<string, MarketRow> {
  const latest = new Map<string, MarketRow>();
  for (const row of rows) {
    if (row.observation_status !== "validated") continue;
    const previous = latest.get(row.indicator_key);
    if (!previous || row.market_date > previous.market_date || (row.market_date === previous.market_date && row.fetched_at > previous.fetched_at)) latest.set(row.indicator_key, row);
  }
  return latest;
}

export async function getMarketDashboardSnapshot(): Promise<MarketDashboardSnapshot> {
  const asOfDate = cairoBusinessDate();
  const [indicators, marketRows, funds, fundPrices, sources, jobs] = await Promise.all([
    supabaseRead<IndicatorRow[]>("/rest/v1/market_indicators?select=indicator_key,display_name,asset_class,base_asset,quote_currency,unit,canonical_definition,primary_source_id,provider_symbol,source_documentation_url,active&active=eq.true&order=indicator_key.asc&limit=20"),
    supabaseRead<MarketRow[]>("/rest/v1/market_observations?select=indicator_key,source_id,source_symbol,market_date,value,unit,source_observed_at,fetched_at,source_url,observation_status&order=market_date.asc&limit=1000"),
    supabaseRead<FundRow[]>("/rest/v1/funds?select=fund_id,canonical_name,category,price_update_url&active=eq.true&order=canonical_name.asc&limit=500"),
    supabaseRead<FundPriceRow[]>(`/rest/v1/fund_prices?select=fund_id,nav,currency,valuation_date,source_id,collected_at,status&status=eq.validated&valuation_date=lte.${asOfDate}&order=valuation_date.desc,collected_at.desc&limit=1000`),
    supabaseRead<SourceRow[]>("/rest/v1/sources?select=source_id,source_name,source_url,source_kind,active&order=source_name.asc&limit=500"),
    supabaseRead<JobRow[]>("/rest/v1/market_data_jobs?select=job_key,job_name,cron_expression,active,last_started_at,last_finished_at,last_status,last_run_summary&job_key=eq.daily_market_data&limit=1"),
  ]);
  const sourceById = new Map(sources.map(source => [source.source_id, source]));
  const latestPrices = selectLatestVerifiedFundPrices(fundPrices, asOfDate);
  const latestMarket = selectLatestMarketObservations(marketRows);
  const resultFunds = funds.map(fund => {
    const price = latestPrices.get(fund.fund_id);
    return { ...fund, latestNav: price ? Number(price.nav) : null, currency: price?.currency ?? null, valuationDate: price?.valuation_date ?? null, sourceName: price ? sourceById.get(price.source_id)?.source_name ?? price.source_id : null, collectedAt: price?.collected_at ?? null, verified: Boolean(price) };
  });
  const resultMarket = indicators.flatMap(indicator => {
    const observation = latestMarket.get(indicator.indicator_key);
    return observation ? [{ ...observation, displayName: indicator.display_name, assetClass: indicator.asset_class, baseAsset: indicator.base_asset, quoteCurrency: indicator.quote_currency, canonicalDefinition: indicator.canonical_definition, sourceName: sourceById.get(observation.source_id)?.source_name ?? null }] : [];
  });
  const resultSources = sources.map(source => {
    const covered = Array.from(latestPrices.values()).filter(price => price.source_id === source.source_id);
    return { ...source, priceCount: fundPrices.filter(price => price.source_id === source.source_id).length, coveredFundCount: new Set(covered.map(price => price.fund_id)).size, latestValuationDate: covered.reduce<string | null>((date, price) => !date || price.valuation_date > date ? price.valuation_date : date, null) };
  }).filter(source => source.priceCount > 0 || source.source_id.startsWith("src_"));
  const coveredFunds = resultFunds.filter(fund => fund.verified).length;
  return { asOfDate, generatedAt: new Date().toISOString(), coverage: { activeFunds: funds.length, coveredFunds, uncoveredFunds: funds.length - coveredFunds, linkedWithoutSnapshot: resultFunds.filter(fund => !fund.verified && Boolean(fund.price_update_url)).length }, market: resultMarket, marketSeries: marketRows.filter(row => row.observation_status === "validated"), funds: resultFunds, sources: resultSources, marketJob: jobs[0] ?? null };
}
