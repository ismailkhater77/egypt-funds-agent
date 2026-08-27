import { callDataApi } from "../server/_core/dataApi";

type ChartPayload = {
  chart?: {
    error?: { code?: string; description?: string } | null;
    result?: Array<{
      meta?: { symbol?: string; instrumentType?: string; currency?: string };
      timestamp?: number[];
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
  };
};

const yahooIndicators = [
  { indicator: "BTC_USD", symbol: "BTC-USD" },
  { indicator: "XAU_USD", symbol: "XAUUSD=X" },
  { indicator: "XAG_USD", symbol: "XAGUSD=X" },
  { indicator: "XAU_USD_ALT", symbol: "XAU=X" },
  { indicator: "XAG_USD_ALT", symbol: "XAG=X" },
  { indicator: "SPX", symbol: "^GSPC" },
  { indicator: "EGX30", symbol: "^CASE30" },
  { indicator: "MSCI_EM", symbol: "^891800-USD-STRD" },
] as const;

function latestObservation(payload: unknown) {
  const chart = payload as ChartPayload;
  const result = chart.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  for (let index = Math.min(timestamps.length, closes.length) - 1; index >= 0; index -= 1) {
    const close = closes[index];
    const timestamp = timestamps[index];
    if (typeof close === "number" && Number.isFinite(close) && typeof timestamp === "number") {
      return {
        marketDate: new Date(timestamp * 1000).toISOString().slice(0, 10),
        close,
      };
    }
  }
  return null;
}

async function verify() {
  const results: Array<Record<string, unknown>> = [];
  for (const candidate of yahooIndicators) {
    try {
      const payload = await callDataApi("YahooFinance/get_stock_chart", {
        query: { symbol: candidate.symbol, interval: "1d", range: "5d", includeAdjustedClose: "false" },
      });
      const chart = payload as ChartPayload;
      const meta = chart.chart?.result?.[0]?.meta;
      results.push({
        indicator: candidate.indicator,
        requestedSymbol: candidate.symbol,
        returnedSymbol: meta?.symbol,
        instrumentType: meta?.instrumentType,
        currency: meta?.currency,
        latest: latestObservation(payload),
        sourceError: chart.chart?.error ?? null,
      });
    } catch (error) {
      results.push({ indicator: candidate.indicator, requestedSymbol: candidate.symbol, error: error instanceof Error ? error.message : String(error) });
    }
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  console.log(JSON.stringify({ source: "YahooFinance/get_stock_chart", results }, null, 2));
}

void verify();
