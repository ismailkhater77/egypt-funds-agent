import type { Request, Response as ExpressResponse } from "express";
import { callDataApi } from "./_core/dataApi";
import { sdk } from "./_core/sdk";

const FRANKFURTER_USD_EGP_URL = "https://api.frankfurter.dev/v2/rate/USD/EGP";
const GOLDAAPI_BASE_URL = "https://www.goldapi.io/api";
const YAHOO_FINANCE_CHART_DOCUMENTATION_URL = "https://finance.yahoo.com/";
const DAILY_MARKET_JOB_KEY = "daily_market_data";

type SourceSpec = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceKind: string;
};

type MarketIndicatorSpec = {
  indicatorKey: "USD_EGP" | "BTC_USD" | "XAU_USD" | "XAG_USD" | "SPX" | "MSCI_EM" | "EGX30";
  displayName: string;
  assetClass: "forex" | "crypto" | "commodity" | "equity_index";
  baseAsset: string;
  quoteCurrency: "EGP" | "USD" | null;
  unit: string;
  canonicalDefinition: string;
  source: SourceSpec;
  sourceSymbol: string;
  sourceDocumentationUrl: string;
};

export type MarketObservationCandidate = {
  indicatorKey: MarketIndicatorSpec["indicatorKey"];
  sourceId: string;
  sourceSymbol: string;
  marketDate: string;
  value: number;
  unit: string;
  sourceObservedAt: string | null;
  sourceUrl: string;
  rawPayload: Record<string, unknown>;
};

type YahooChartPayload = {
  chart?: {
    error?: { code?: string; description?: string } | null;
    result?: Array<{
      meta?: { symbol?: string; instrumentType?: string; currency?: string | null; regularMarketTime?: number };
      timestamp?: number[];
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
  };
};

type FrankfurterPayload = { date?: string; base?: string; quote?: string; rate?: number };
type GoldApiPayload = { timestamp?: string | number; price?: number; metal?: string; currency?: string; error?: unknown };
type StoredObservation = { value: string | number; unit: string; source_observed_at: string | null; source_url: string };

const frankfurterSource: SourceSpec = {
  sourceId: "src_frankfurter_usd_egp",
  sourceName: "Frankfurter — USD/EGP",
  sourceUrl: FRANKFURTER_USD_EGP_URL,
  sourceKind: "public_exchange_rate_api",
};

const yahooSource: SourceSpec = {
  sourceId: "src_yahoo_finance_market_data",
  sourceName: "Yahoo Finance — market chart data",
  sourceUrl: YAHOO_FINANCE_CHART_DOCUMENTATION_URL,
  sourceKind: "platform_market_data_api",
};

const goldApiSource: SourceSpec = {
  sourceId: "src_goldapi_free_spot",
  sourceName: "GoldAPI Free — XAU/XAG spot",
  sourceUrl: "https://www.goldapi.io/price/XAU/USD/free",
  sourceKind: "free_metal_price_api",
};

export const marketIndicatorSpecs: readonly MarketIndicatorSpec[] = [
  {
    indicatorKey: "USD_EGP",
    displayName: "US Dollar / Egyptian Pound",
    assetClass: "forex",
    baseAsset: "USD",
    quoteCurrency: "EGP",
    unit: "EGP_per_USD",
    canonicalDefinition: "Egyptian pounds per one U.S. dollar.",
    source: frankfurterSource,
    sourceSymbol: "USD/EGP",
    sourceDocumentationUrl: "https://frankfurter.dev/",
  },
  {
    indicatorKey: "BTC_USD",
    displayName: "Bitcoin / U.S. Dollar",
    assetClass: "crypto",
    baseAsset: "BTC",
    quoteCurrency: "USD",
    unit: "USD_per_BTC",
    canonicalDefinition: "U.S. dollars per one Bitcoin using the Yahoo Finance BTC-USD daily chart.",
    source: yahooSource,
    sourceSymbol: "BTC-USD",
    sourceDocumentationUrl: YAHOO_FINANCE_CHART_DOCUMENTATION_URL,
  },
  {
    indicatorKey: "XAU_USD",
    displayName: "Gold spot / U.S. Dollar",
    assetClass: "commodity",
    baseAsset: "XAU",
    quoteCurrency: "USD",
    unit: "USD_per_troy_ounce",
    canonicalDefinition: "U.S. dollars per troy ounce of gold spot.",
    source: goldApiSource,
    sourceSymbol: "XAU/USD",
    sourceDocumentationUrl: "https://www.goldapi.io/price/XAU/USD/free",
  },
  {
    indicatorKey: "XAG_USD",
    displayName: "Silver spot / U.S. Dollar",
    assetClass: "commodity",
    baseAsset: "XAG",
    quoteCurrency: "USD",
    unit: "USD_per_troy_ounce",
    canonicalDefinition: "U.S. dollars per troy ounce of silver spot.",
    source: goldApiSource,
    sourceSymbol: "XAG/USD",
    sourceDocumentationUrl: "https://www.goldapi.io/price/XAU/USD/free",
  },
  {
    indicatorKey: "SPX",
    displayName: "S&P 500",
    assetClass: "equity_index",
    baseAsset: "S&P 500",
    quoteCurrency: "USD",
    unit: "index_points",
    canonicalDefinition: "S&P 500 daily index close.",
    source: yahooSource,
    sourceSymbol: "^GSPC",
    sourceDocumentationUrl: YAHOO_FINANCE_CHART_DOCUMENTATION_URL,
  },
  {
    indicatorKey: "MSCI_EM",
    displayName: "MSCI Emerging Markets Index",
    assetClass: "equity_index",
    baseAsset: "MSCI Emerging Markets",
    quoteCurrency: "USD",
    unit: "index_points",
    canonicalDefinition: "MSCI Emerging Markets USD Price Return Index, standard daily total return data identifier STRD.",
    source: yahooSource,
    sourceSymbol: "^891800-USD-STRD",
    sourceDocumentationUrl: YAHOO_FINANCE_CHART_DOCUMENTATION_URL,
  },
  {
    indicatorKey: "EGX30",
    displayName: "EGX 30 Price Return Index",
    assetClass: "equity_index",
    baseAsset: "EGX 30",
    quoteCurrency: "EGP",
    unit: "index_points",
    canonicalDefinition: "EGX 30 Price Return Index in Egyptian pounds; no CFD, ETF, or futures substitution.",
    source: yahooSource,
    sourceSymbol: "^CASE30",
    sourceDocumentationUrl: YAHOO_FINANCE_CHART_DOCUMENTATION_URL,
  },
];

export type MarketRunSummary = {
  runId: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "partial" | "error";
  fetched: number;
  inserted: number;
  updated: number;
  unchanged: number;
  failed: Array<{ indicatorKey: string; error: string }>;
};

export type MarketHistorySummary = MarketRunSummary & {
  fromDate: string;
  toDate: string;
};

function cairoBusinessDate(now = new Date()): string {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => values.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function assertPositiveFinite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new Error(`${label} must be a positive finite number`);
  return value;
}

function assertIsoDate(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${label} must be an ISO calendar date`);
  }
  if (value > cairoBusinessDate()) throw new Error(`${label} is in the future: ${value}`);
  return value;
}

function isoTimeFromUnix(timestamp: unknown): string | null {
  return typeof timestamp === "number" && Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : null;
}

export function parseFrankfurterUsdEgp(payload: unknown): MarketObservationCandidate {
  const data = payload as FrankfurterPayload;
  if (data.base !== "USD" || data.quote !== "EGP") throw new Error("Frankfurter response does not confirm USD/EGP identity");
  const marketDate = assertIsoDate(data.date, "Frankfurter date");
  return {
    indicatorKey: "USD_EGP",
    sourceId: frankfurterSource.sourceId,
    sourceSymbol: "USD/EGP",
    marketDate,
    value: assertPositiveFinite(data.rate, "Frankfurter USD/EGP rate"),
    unit: "EGP_per_USD",
    sourceObservedAt: null,
    sourceUrl: FRANKFURTER_USD_EGP_URL,
    rawPayload: { base: data.base, quote: data.quote, date: marketDate, rate: data.rate },
  };
}

export function parseGoldApiSpot(pair: "XAU/USD" | "XAG/USD", payload: unknown): MarketObservationCandidate {
  const data = payload as GoldApiPayload;
  const expectedMetal = pair.slice(0, 3);
  if (data.metal && data.metal.toUpperCase() !== expectedMetal) throw new Error(`GoldAPI returned ${data.metal} for ${pair}`);
  if (data.currency && data.currency.toUpperCase() !== "USD") throw new Error(`GoldAPI returned ${data.currency} for ${pair}`);
  const sourceObservedAt = typeof data.timestamp === "string" && !Number.isNaN(Date.parse(data.timestamp))
    ? new Date(data.timestamp).toISOString()
    : typeof data.timestamp === "number" && Number.isFinite(data.timestamp)
      ? new Date(data.timestamp < 100_000_000_000 ? data.timestamp * 1000 : data.timestamp).toISOString()
      : null;
  if (!sourceObservedAt) throw new Error(`GoldAPI ${pair} response has no valid timestamp`);
  const indicatorKey = expectedMetal === "XAU" ? "XAU_USD" : "XAG_USD";
  const sourceUrl = `${GOLDAAPI_BASE_URL}/${pair}`;
  return {
    indicatorKey,
    sourceId: goldApiSource.sourceId,
    sourceSymbol: pair,
    marketDate: assertIsoDate(sourceObservedAt.slice(0, 10), `GoldAPI ${pair} date`),
    value: assertPositiveFinite(data.price, `GoldAPI ${pair} price`),
    unit: "USD_per_troy_ounce",
    sourceObservedAt,
    sourceUrl,
    rawPayload: { metal: data.metal ?? expectedMetal, currency: data.currency ?? "USD", timestamp: sourceObservedAt, price: data.price },
  };
}

export function parseYahooDailyChart(indicatorKey: Extract<MarketIndicatorSpec["indicatorKey"], "BTC_USD" | "SPX" | "MSCI_EM" | "EGX30">, expectedSymbol: string, payload: unknown): MarketObservationCandidate {
  const data = payload as YahooChartPayload;
  const error = data.chart?.error;
  if (error) throw new Error(`Yahoo Finance ${expectedSymbol}: ${error.code ?? "error"} ${error.description ?? ""}`.trim());
  const chart = data.chart?.result?.[0];
  const meta = chart?.meta;
  if (meta?.symbol !== expectedSymbol) throw new Error(`Yahoo Finance identity mismatch: expected ${expectedSymbol}, got ${meta?.symbol ?? "none"}`);
  if (indicatorKey === "BTC_USD" && meta.instrumentType !== "CRYPTOCURRENCY") throw new Error("Yahoo Finance BTC/USD is not marked as cryptocurrency");
  if (indicatorKey !== "BTC_USD" && meta.instrumentType !== "INDEX") throw new Error(`Yahoo Finance ${expectedSymbol} is not marked as an index`);
  const timestamps = chart?.timestamp ?? [];
  const closes = chart?.indicators?.quote?.[0]?.close ?? [];
  let latest: { timestamp: number; close: number } | null = null;
  for (let index = Math.min(timestamps.length, closes.length) - 1; index >= 0; index -= 1) {
    const timestamp = timestamps[index];
    const close = closes[index];
    if (typeof timestamp === "number" && Number.isFinite(timestamp) && typeof close === "number" && Number.isFinite(close) && close > 0) {
      latest = { timestamp, close };
      break;
    }
  }
  if (!latest) throw new Error(`Yahoo Finance ${expectedSymbol} has no valid daily close`);
  const marketDate = assertIsoDate(new Date(latest.timestamp * 1000).toISOString().slice(0, 10), `Yahoo Finance ${expectedSymbol} market date`);
  const unit = indicatorKey === "BTC_USD" ? "USD_per_BTC" : "index_points";
  return {
    indicatorKey,
    sourceId: yahooSource.sourceId,
    sourceSymbol: expectedSymbol,
    marketDate,
    value: latest.close,
    unit,
    sourceObservedAt: isoTimeFromUnix(meta.regularMarketTime),
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(expectedSymbol)}/`,
    rawPayload: { symbol: meta.symbol, instrument_type: meta.instrumentType, currency: meta.currency ?? null, regular_market_time: meta.regularMarketTime ?? null, market_date: marketDate, close: latest.close },
  };
}

export function parseYahooDailyHistory(indicatorKey: Extract<MarketIndicatorSpec["indicatorKey"], "BTC_USD" | "SPX" | "MSCI_EM" | "EGX30">, expectedSymbol: string, payload: unknown): MarketObservationCandidate[] {
  parseYahooDailyChart(indicatorKey, expectedSymbol, payload);
  const data = payload as YahooChartPayload;
  const chart = data.chart?.result?.[0];
  const timestamps = chart?.timestamp ?? [];
  const closes = chart?.indicators?.quote?.[0]?.close ?? [];
  const unit = indicatorKey === "BTC_USD" ? "USD_per_BTC" : "index_points";
  const records = new Map<string, MarketObservationCandidate>();
  for (let index = 0; index < Math.min(timestamps.length, closes.length); index += 1) {
    const timestamp = timestamps[index];
    const close = closes[index];
    if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || typeof close !== "number" || !Number.isFinite(close) || close <= 0) continue;
    const marketDate = assertIsoDate(new Date(timestamp * 1000).toISOString().slice(0, 10), `Yahoo Finance ${expectedSymbol} market date`);
    records.set(marketDate, {
      indicatorKey,
      sourceId: yahooSource.sourceId,
      sourceSymbol: expectedSymbol,
      marketDate,
      value: close,
      unit,
      sourceObservedAt: null,
      sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(expectedSymbol)}/history/`,
      rawPayload: { symbol: expectedSymbol, market_date: marketDate, close, interval: "1d" },
    });
  }
  return Array.from(records.values()).sort((left, right) => left.marketDate.localeCompare(right.marketDate));
}

export function recentMarketHistoryRange(days: number, today = cairoBusinessDate()): { fromDate: string; toDate: string } {
  if (!Number.isInteger(days) || days < 1 || days > 7) throw new Error("Free market-history import supports from 1 to 7 calendar days only");
  const end = new Date(`${today}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { fromDate: start.toISOString().slice(0, 10), toDate: end.toISOString().slice(0, 10) };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 500)}`);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

async function upsertCatalog(): Promise<void> {
  const sourceRows = Array.from(new Map(marketIndicatorSpecs.map(spec => [spec.source.sourceId, spec.source])).values()).map(source => ({
    source_id: source.sourceId,
    source_name: source.sourceName,
    source_url: source.sourceUrl,
    source_kind: source.sourceKind,
    active: true,
  }));
  await supabaseRequest("/rest/v1/sources?on_conflict=source_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(sourceRows),
  });
  const indicators = marketIndicatorSpecs.map(spec => ({
    indicator_key: spec.indicatorKey,
    display_name: spec.displayName,
    asset_class: spec.assetClass,
    base_asset: spec.baseAsset,
    quote_currency: spec.quoteCurrency,
    unit: spec.unit,
    canonical_definition: spec.canonicalDefinition,
    primary_source_id: spec.source.sourceId,
    provider_symbol: spec.sourceSymbol,
    source_documentation_url: spec.sourceDocumentationUrl,
    active: true,
  }));
  await supabaseRequest("/rest/v1/market_indicators?on_conflict=indicator_key", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(indicators),
  });
  await supabaseRequest("/rest/v1/market_data_jobs?on_conflict=job_key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({ job_key: DAILY_MARKET_JOB_KEY, job_name: "Daily Market Data", cron_expression: "0 30 21 * * *", active: false }),
  });
}

async function persistObservation(candidate: MarketObservationCandidate): Promise<"inserted" | "updated" | "unchanged"> {
  const filter = `indicator_key=eq.${encodeURIComponent(candidate.indicatorKey)}&source_id=eq.${encodeURIComponent(candidate.sourceId)}&source_symbol=eq.${encodeURIComponent(candidate.sourceSymbol)}&market_date=eq.${candidate.marketDate}`;
  const existing = await supabaseRequest<StoredObservation[]>(`/rest/v1/market_observations?select=value,unit,source_observed_at,source_url&${filter}`);
  const row = existing[0];
  const sourceObservedAt = candidate.sourceObservedAt ?? row?.source_observed_at ?? null;
  if (row && Number(row.value) === candidate.value && row.unit === candidate.unit && (row.source_observed_at ?? null) === sourceObservedAt && row.source_url === candidate.sourceUrl) return "unchanged";
  const databaseRow = {
    indicator_key: candidate.indicatorKey,
    source_id: candidate.sourceId,
    source_symbol: candidate.sourceSymbol,
    market_date: candidate.marketDate,
    value: candidate.value,
    unit: candidate.unit,
    source_observed_at: sourceObservedAt,
    source_url: candidate.sourceUrl,
    raw_payload: candidate.rawPayload,
    observation_status: "validated",
    updated_at: new Date().toISOString(),
  };
  if (row) {
    await supabaseRequest(`/rest/v1/market_observations?${filter}`, { method: "PATCH", body: JSON.stringify(databaseRow) });
    return "updated";
  }
  await supabaseRequest("/rest/v1/market_observations", { method: "POST", body: JSON.stringify(databaseRow) });
  return "inserted";
}

async function fetchFrankfurterCandidate(): Promise<MarketObservationCandidate> {
  const frankfurterPayload = await fetch(FRANKFURTER_USD_EGP_URL).then(async response => {
    if (!response.ok) throw new Error(`Frankfurter HTTP ${response.status}`);
    return response.json();
  });
  return parseFrankfurterUsdEgp(frankfurterPayload);
}

async function fetchGoldApiCandidate(pair: "XAU/USD" | "XAG/USD"): Promise<MarketObservationCandidate> {
  const goldApiKey = process.env.GOLDAPI_API_KEY;
  if (!goldApiKey) throw new Error("GOLDAPI_API_KEY is missing");
  const response = await fetch(`${GOLDAAPI_BASE_URL}/${pair}`, { headers: { "x-access-token": goldApiKey, Accept: "application/json" } });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`GoldAPI ${pair} HTTP ${response.status}`);
  return parseGoldApiSpot(pair, payload);
}

async function fetchYahooCandidate(spec: MarketIndicatorSpec): Promise<MarketObservationCandidate> {
  const payload = await callDataApi("YahooFinance/get_stock_chart", {
    query: { symbol: spec.sourceSymbol, interval: "1d", range: "5d", includeAdjustedClose: "false" },
  });
  return parseYahooDailyChart(spec.indicatorKey as "BTC_USD" | "SPX" | "MSCI_EM" | "EGX30", spec.sourceSymbol, payload);
}

async function fetchGoldApiHistoryCandidate(pair: "XAU/USD" | "XAG/USD", marketDate: string): Promise<MarketObservationCandidate> {
  const goldApiKey = process.env.GOLDAPI_API_KEY;
  if (!goldApiKey) throw new Error("GOLDAPI_API_KEY is missing");
  const datePath = marketDate.replaceAll("-", "");
  const response = await fetch(`${GOLDAAPI_BASE_URL}/${pair}/${datePath}`, { headers: { "x-access-token": goldApiKey, Accept: "application/json" } });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`GoldAPI ${pair} history ${marketDate} HTTP ${response.status}`);
  const candidate = parseGoldApiSpot(pair, payload);
  if (candidate.marketDate !== marketDate) throw new Error(`GoldAPI ${pair} history identity mismatch: requested ${marketDate}, got ${candidate.marketDate}`);
  return { ...candidate, sourceUrl: `${GOLDAAPI_BASE_URL}/${pair}/${datePath}` };
}

async function persistCandidate(summary: MarketRunSummary, candidate: MarketObservationCandidate): Promise<void> {
  const outcome = await persistObservation(candidate);
  summary[outcome] += 1;
}

async function updateJob(summary: MarketRunSummary): Promise<void> {
  await supabaseRequest(`/rest/v1/market_data_jobs?job_key=eq.${DAILY_MARKET_JOB_KEY}`, {
    method: "PATCH",
    body: JSON.stringify({ last_started_at: summary.startedAt, last_finished_at: summary.finishedAt, last_status: summary.status, last_run_summary: summary, updated_at: new Date().toISOString() }),
  });
}

export async function runMarketDataCollector(): Promise<MarketRunSummary> {
  const startedAt = new Date().toISOString();
  const summary: MarketRunSummary = { runId: crypto.randomUUID(), startedAt, finishedAt: startedAt, status: "success", fetched: 0, inserted: 0, updated: 0, unchanged: 0, failed: [] };
  try {
    await upsertCatalog();
    for (const spec of marketIndicatorSpecs) {
      try {
        const candidate = spec.indicatorKey === "USD_EGP"
          ? await fetchFrankfurterCandidate()
          : spec.indicatorKey === "XAU_USD" || spec.indicatorKey === "XAG_USD"
            ? await fetchGoldApiCandidate(spec.sourceSymbol as "XAU/USD" | "XAG/USD")
            : await fetchYahooCandidate(spec);
        summary.fetched += 1;
        await persistCandidate(summary, candidate);
      } catch (error) {
        summary.failed.push({ indicatorKey: spec.indicatorKey, error: error instanceof Error ? error.message : String(error) });
      }
      if (spec.source.sourceId === yahooSource.sourceId) await new Promise(resolve => setTimeout(resolve, 800));
    }
  } catch (error) {
    summary.failed.push({ indicatorKey: "pipeline", error: error instanceof Error ? error.message : String(error) });
  }
  summary.finishedAt = new Date().toISOString();
  summary.status = summary.failed.length === 0 ? "success" : summary.fetched > 0 ? "partial" : "error";
  try {
    await updateJob(summary);
  } catch (error) {
    summary.failed.push({ indicatorKey: "job_audit", error: error instanceof Error ? error.message : String(error) });
    summary.status = summary.fetched > 0 ? "partial" : "error";
  }
  return summary;
}

export async function runMarketDataHistoryImport(days = 7): Promise<MarketHistorySummary> {
  const { fromDate, toDate } = recentMarketHistoryRange(days);
  const startedAt = new Date().toISOString();
  const summary: MarketHistorySummary = { runId: crypto.randomUUID(), startedAt, finishedAt: startedAt, status: "success", fetched: 0, inserted: 0, updated: 0, unchanged: 0, failed: [], fromDate, toDate };
  try {
    await upsertCatalog();
  } catch (error) {
    summary.failed.push({ indicatorKey: "catalog", error: error instanceof Error ? error.message : String(error) });
  }
  if (summary.failed.length === 0) {
    try {
      const frankfurterUrl = `${FRANKFURTER_USD_EGP_URL.replace("/rate/USD/EGP", "/rates")}?from=${fromDate}&to=${toDate}&base=USD&quotes=EGP`;
      const response = await fetch(frankfurterUrl);
      if (!response.ok) throw new Error(`Frankfurter history HTTP ${response.status}`);
      const payload = await response.json() as unknown;
      if (!Array.isArray(payload)) throw new Error("Frankfurter history is not an array");
      for (const row of payload) {
        const candidate = parseFrankfurterUsdEgp(row);
        summary.fetched += 1;
        await persistCandidate(summary, candidate);
      }
    } catch (error) {
      summary.failed.push({ indicatorKey: "USD_EGP", error: error instanceof Error ? error.message : String(error) });
    }

    for (const spec of marketIndicatorSpecs.filter(item => item.source.sourceId === yahooSource.sourceId)) {
      try {
        const payload = await callDataApi("YahooFinance/get_stock_chart", { query: { symbol: spec.sourceSymbol, interval: "1d", range: "1mo", includeAdjustedClose: "false" } });
        const records = parseYahooDailyHistory(spec.indicatorKey as "BTC_USD" | "SPX" | "MSCI_EM" | "EGX30", spec.sourceSymbol, payload)
          .filter(candidate => candidate.marketDate >= fromDate && candidate.marketDate <= toDate);
        for (const candidate of records) {
          summary.fetched += 1;
          await persistCandidate(summary, candidate);
        }
      } catch (error) {
        summary.failed.push({ indicatorKey: spec.indicatorKey, error: error instanceof Error ? error.message : String(error) });
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    for (const pair of ["XAU/USD", "XAG/USD"] as const) {
      const indicatorKey = pair.startsWith("XAU") ? "XAU_USD" : "XAG_USD";
      for (let cursor = new Date(`${fromDate}T00:00:00.000Z`); cursor <= new Date(`${toDate}T00:00:00.000Z`); cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        const marketDate = cursor.toISOString().slice(0, 10);
        try {
          const candidate = await fetchGoldApiHistoryCandidate(pair, marketDate);
          summary.fetched += 1;
          await persistCandidate(summary, candidate);
        } catch (error) {
          summary.failed.push({ indicatorKey, error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
  }
  summary.finishedAt = new Date().toISOString();
  summary.status = summary.failed.length === 0 ? "success" : summary.fetched > 0 ? "partial" : "error";
  return summary;
}

async function requireAuthenticated(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (user.isCron) throw new Error("cron caller is not allowed on manual endpoint");
  return user;
}

export async function manualMarketDataRunHandler(req: Request, res: ExpressResponse) {
  try {
    await requireAuthenticated(req);
    res.json(await runMarketDataCollector());
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "unauthorized" });
  }
}

export function isActiveScheduledMarketJob(job: { active: boolean } | undefined): boolean {
  return job?.active === true;
}

export async function scheduledMarketDataHandler(req: Request, res: ExpressResponse) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const jobs = await supabaseRequest<Array<{ job_key: string; active: boolean }>>(`/rest/v1/market_data_jobs?select=job_key,active&job_key=eq.${DAILY_MARKET_JOB_KEY}&schedule_cron_task_uid=eq.${encodeURIComponent(user.taskUid)}&limit=1`);
    if (!isActiveScheduledMarketJob(jobs[0])) return res.json({ ok: true, skipped: "orphan_or_inactive_schedule" });
    res.json(await runMarketDataCollector());
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error), timestamp: new Date().toISOString() });
  }
}
