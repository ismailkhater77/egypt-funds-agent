import { callDataApi } from "../server/_core/dataApi";

type Chart = { chart?: { result?: Array<{ meta?: { symbol?: string }; timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> } };

async function run() {
  const results: Array<Record<string, unknown>> = [];
  for (const symbol of ["^CASE30", "^891800-USD-STRD"]) {
    try {
      const payload = await callDataApi("YahooFinance/get_stock_chart", { query: { symbol, interval: "1d", range: "1mo", includeAdjustedClose: "false" } }) as Chart;
      const chart = payload.chart?.result?.[0];
      const timestamps = chart?.timestamp ?? [];
      const closes = chart?.indicators?.quote?.[0]?.close ?? [];
      const validRows = timestamps.reduce((count, timestamp, index) => count + (typeof timestamp === "number" && typeof closes[index] === "number" && Number.isFinite(closes[index] as number) ? 1 : 0), 0);
      results.push({ requestedSymbol: symbol, returnedSymbol: chart?.meta?.symbol ?? null, timestamps: timestamps.length, validDailyCloses: validRows });
    } catch (error) {
      results.push({ requestedSymbol: symbol, error: error instanceof Error ? error.message : String(error) });
    }
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  console.log(JSON.stringify(results, null, 2));
}

void run();
