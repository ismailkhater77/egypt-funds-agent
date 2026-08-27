import { callDataApi } from "../server/_core/dataApi";

type Chart = { chart?: { result?: Array<{ meta?: { symbol?: string }; timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> } };

const period1 = String(Math.floor(Date.parse("2026-08-01T00:00:00Z") / 1000));
const period2 = String(Math.floor(Date.parse("2026-08-28T00:00:00Z") / 1000));

async function run() {
  const results: Array<Record<string, unknown>> = [];
  for (const symbol of ["^CASE30", "^891800-USD-STRD"]) {
    try {
      const payload = await callDataApi("YahooFinance/get_stock_chart", { query: { symbol, interval: "1d", period1, period2, includeAdjustedClose: "false" } }) as Chart;
      const chart = payload.chart?.result?.[0];
      const closes = chart?.indicators?.quote?.[0]?.close ?? [];
      const timestamps = chart?.timestamp ?? [];
      const validDailyCloses = timestamps.filter((timestamp, index) => typeof timestamp === "number" && typeof closes[index] === "number" && Number.isFinite(closes[index] as number)).length;
      results.push({ requestedSymbol: symbol, returnedSymbol: chart?.meta?.symbol ?? null, timestamps: timestamps.length, validDailyCloses });
    } catch (error) {
      results.push({ requestedSymbol: symbol, error: error instanceof Error ? error.message : String(error) });
    }
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  console.log(JSON.stringify(results, null, 2));
}

void run();
