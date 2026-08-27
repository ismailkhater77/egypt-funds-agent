import { describe, expect, it } from "vitest";
import { marketIndicatorSpecs, parseFrankfurterUsdEgp, parseGoldApiSpot, parseYahooDailyChart, parseYahooDailyHistory, recentMarketHistoryRange } from "./marketDataCollector";

describe("market data catalog", () => {
  it("contains each requested indicator exactly once with no ETF, CFD, or futures substitute", () => {
    expect(marketIndicatorSpecs.map(item => item.indicatorKey)).toEqual(["USD_EGP", "BTC_USD", "XAU_USD", "XAG_USD", "SPX", "MSCI_EM", "EGX30"]);
    expect(marketIndicatorSpecs.find(item => item.indicatorKey === "EGX30")?.sourceSymbol).toBe("^CASE30");
    expect(marketIndicatorSpecs.find(item => item.indicatorKey === "MSCI_EM")?.sourceSymbol).toBe("^891800-USD-STRD");
  });
});

describe("free historical-import bounds", () => {
  it("limits the free plan to seven prior calendar days and excludes today", () => {
    expect(recentMarketHistoryRange(7, "2026-08-27")).toEqual({ fromDate: "2026-08-20", toDate: "2026-08-26" });
  });

  it("rejects a history request that would exceed the free metals budget", () => {
    expect(() => recentMarketHistoryRange(8, "2026-08-27")).toThrow("1 to 7 calendar days");
  });
});

describe("free-source parsers", () => {
  it("accepts a dated USD/EGP Frankfurter response", () => {
    const observation = parseFrankfurterUsdEgp({ date: "2026-08-27", base: "USD", quote: "EGP", rate: 50.366 });
    expect(observation).toMatchObject({ indicatorKey: "USD_EGP", marketDate: "2026-08-27", value: 50.366, unit: "EGP_per_USD" });
  });

  it("rejects a Frankfurter response with inverted identity", () => {
    expect(() => parseFrankfurterUsdEgp({ date: "2026-08-27", base: "EGP", quote: "USD", rate: 0.02 })).toThrow("does not confirm USD/EGP");
  });

  it("accepts a dated XAU/USD spot response and preserves troy-ounce units", () => {
    const observation = parseGoldApiSpot("XAU/USD", { metal: "XAU", currency: "USD", timestamp: 1787823605, price: 3375.52 });
    expect(observation).toMatchObject({ indicatorKey: "XAU_USD", marketDate: "2026-08-27", value: 3375.52, unit: "USD_per_troy_ounce" });
  });

  it("accepts GoldAPI historical timestamps expressed in milliseconds", () => {
    const observation = parseGoldApiSpot("XAU/USD", { metal: "XAU", currency: "USD", timestamp: 1787736600000, price: 4621.05 });
    expect(observation).toMatchObject({ indicatorKey: "XAU_USD", marketDate: "2026-08-26", sourceObservedAt: "2026-08-26T09:30:00.000Z" });
  });

  it("rejects a metal source response with no timestamp", () => {
    expect(() => parseGoldApiSpot("XAG/USD", { metal: "XAG", currency: "USD", price: 39.2 })).toThrow("no valid timestamp");
  });

  it("accepts the exact EGX30 Price Return Index and chooses its latest valid close", () => {
    const observation = parseYahooDailyChart("EGX30", "^CASE30", {
      chart: {
        result: [{
          meta: { symbol: "^CASE30", instrumentType: "INDEX", currency: "EGP", regularMarketTime: 1787831111 },
          timestamp: [1787788800, 1787875200],
          indicators: { quote: [{ close: [55106.5, null] }] },
        }],
      },
    });
    expect(observation).toMatchObject({ indicatorKey: "EGX30", sourceSymbol: "^CASE30", marketDate: "2026-08-27", value: 55106.5, unit: "index_points" });
  });

  it("extracts only valid daily closes from exact Yahoo historical chart data", () => {
    const observations = parseYahooDailyHistory("SPX", "^GSPC", {
      chart: {
        result: [{
          meta: { symbol: "^GSPC", instrumentType: "INDEX", currency: "USD" },
          timestamp: [1787702400, 1787788800],
          indicators: { quote: [{ close: [7675.7, null] }] },
        }],
      },
    });
    expect(observations).toHaveLength(1);
    expect(observations[0]).toMatchObject({ indicatorKey: "SPX", marketDate: "2026-08-26", value: 7675.7, sourceObservedAt: null });
  });

  it("rejects an ETF in place of MSCI Emerging Markets Index", () => {
    expect(() => parseYahooDailyChart("MSCI_EM", "^891800-USD-STRD", {
      chart: { result: [{ meta: { symbol: "EEM", instrumentType: "ETF" }, timestamp: [1787788800], indicators: { quote: [{ close: [67.17] }] } }] },
    })).toThrow("identity mismatch");
  });
});
