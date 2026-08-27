import { describe, expect, it } from "vitest";
import { buildCompatibleChart, selectLatestMarketObservations, selectLatestVerifiedFundPrices, toPublicMarketDashboardSnapshot, type MarketDashboardSnapshot } from "./marketDashboard";

describe("market dashboard selection", () => {
  it("uses the latest validated fund value that is not future-dated", () => {
    const rows = [
      { fund_id: "fund-a", nav: 11, currency: "EGP", valuation_date: "2026-08-26", source_id: "source-a", collected_at: "2026-08-26T08:00:00Z", status: "validated" },
      { fund_id: "fund-a", nav: 12, currency: "EGP", valuation_date: "2026-08-27", source_id: "source-b", collected_at: "2026-08-27T08:00:00Z", status: "validated" },
      { fund_id: "fund-b", nav: 20, currency: "EGP", valuation_date: "2026-08-28", source_id: "source-a", collected_at: "2026-08-27T08:00:00Z", status: "validated" },
    ];
    const selected = selectLatestVerifiedFundPrices(rows, "2026-08-27");
    expect(selected.get("fund-a")?.nav).toBe(12);
    expect(selected.has("fund-b")).toBe(false);
  });

  it("uses the latest fetched observation for a market day and skips review rows", () => {
    const rows = [
      { indicator_key: "SPX", source_id: "source-a", source_symbol: "^GSPC", market_date: "2026-08-26", value: 100, unit: "index_points", source_observed_at: null, fetched_at: "2026-08-26T01:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "SPX", source_id: "source-a", source_symbol: "^GSPC", market_date: "2026-08-26", value: 101, unit: "index_points", source_observed_at: null, fetched_at: "2026-08-26T02:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "BTC_USD", source_id: "source-a", source_symbol: "BTC-USD", market_date: "2026-08-27", value: 1, unit: "USD_per_BTC", source_observed_at: null, fetched_at: "2026-08-27T02:00:00Z", source_url: "https://example.test", observation_status: "review" },
    ];
    const selected = selectLatestMarketObservations(rows);
    expect(selected.get("SPX")?.value).toBe(101);
    expect(selected.has("BTC_USD")).toBe(false);
  });

  it("removes source details, source URLs, collection metadata, and job history from the public snapshot", () => {
    const snapshot = {
      asOfDate: "2026-08-27", generatedAt: "2026-08-27T12:00:00.000Z", coverage: { activeFunds: 1, coveredFunds: 1, uncoveredFunds: 0, linkedWithoutSnapshot: 0 },
      market: [{ indicator_key: "USD_EGP", source_id: "source-secret", source_symbol: "USD/EGP", market_date: "2026-08-27", value: 50, unit: "EGP_per_USD", source_observed_at: "2026-08-27T11:00:00.000Z", fetched_at: "2026-08-27T11:01:00.000Z", source_url: "https://private.example", observation_status: "validated", displayName: "US Dollar / Egyptian Pound", assetClass: "forex", baseAsset: "USD", quoteCurrency: "EGP", canonicalDefinition: "EGP per USD", sourceName: "Private source" }],
      marketSeries: [{ indicator_key: "USD_EGP", source_id: "source-secret", source_symbol: "USD/EGP", market_date: "2026-08-27", value: 50, unit: "EGP_per_USD", source_observed_at: null, fetched_at: "2026-08-27T11:01:00.000Z", source_url: "https://private.example", observation_status: "validated" }],
      funds: [{ fund_id: "fund-1", canonical_name: "Fund One", category: null, price_update_url: "https://private.example/fund", latestNav: 10, currency: "EGP", valuationDate: "2026-08-27", sourceName: "Private source", collectedAt: "2026-08-27T11:01:00.000Z", verified: true }],
      sources: [{ source_id: "source-secret", source_name: "Private source", source_url: "https://private.example", source_kind: "private", active: true, priceCount: 1, coveredFundCount: 1, latestValuationDate: "2026-08-27" }],
      marketJob: { job_key: "job", job_name: "Private job", cron_expression: "secret", active: true, last_started_at: null, last_finished_at: null, last_status: "success", last_run_summary: {} },
    } satisfies MarketDashboardSnapshot;
    const publicSnapshot = toPublicMarketDashboardSnapshot(snapshot);
    expect(JSON.stringify(publicSnapshot)).not.toContain("source-secret");
    expect(JSON.stringify(publicSnapshot)).not.toContain("private.example");
    expect(JSON.stringify(publicSnapshot)).not.toContain("Private job");
    expect(publicSnapshot.funds[0]).not.toHaveProperty("price_update_url");
    expect(publicSnapshot.market[0]).not.toHaveProperty("sourceName");
  });

  it("emits chart points only for complete series observed over identical dates", () => {
    const rows = [
      { indicator_key: "USD_EGP", source_id: "fx", source_symbol: "USD/EGP", market_date: "2026-08-20", value: 50, unit: "EGP_per_USD", source_observed_at: null, fetched_at: "2026-08-20T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "USD_EGP", source_id: "fx", source_symbol: "USD/EGP", market_date: "2026-08-21", value: 51, unit: "EGP_per_USD", source_observed_at: null, fetched_at: "2026-08-21T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "BTC_USD", source_id: "crypto", source_symbol: "BTC-USD", market_date: "2026-08-20", value: 100, unit: "USD_per_BTC", source_observed_at: null, fetched_at: "2026-08-20T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "BTC_USD", source_id: "crypto", source_symbol: "BTC-USD", market_date: "2026-08-21", value: 200, unit: "USD_per_BTC", source_observed_at: null, fetched_at: "2026-08-21T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "EGX30", source_id: "egx", source_symbol: "^CASE30", market_date: "2026-08-21", value: 1000, unit: "index_points", source_observed_at: null, fetched_at: "2026-08-21T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
    ];
    const chart = buildCompatibleChart(rows, ["USD_EGP", "BTC_USD", "EGX30"]);
    expect(chart).toMatchObject({ status: "ready", indicatorKeys: ["USD_EGP", "BTC_USD"], excludedIndicatorKeys: ["EGX30"], startDate: "2026-08-20", endDate: "2026-08-21", pointCount: 2 });
    expect(chart.points[0]).toMatchObject({ date: "2026-08-20", USD_EGP: 100, BTC_USD: 100 });
    expect(chart.points[1]).toMatchObject({ date: "2026-08-21", USD_EGP: 102, BTC_USD: 204 });
    expect(chart.points[1]).not.toHaveProperty("EGX30");
  });

  it("does not emit a chart when complete series lack at least two shared dates", () => {
    const rows = [
      { indicator_key: "USD_EGP", source_id: "fx", source_symbol: "USD/EGP", market_date: "2026-08-20", value: 50, unit: "EGP_per_USD", source_observed_at: null, fetched_at: "2026-08-20T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "USD_EGP", source_id: "fx", source_symbol: "USD/EGP", market_date: "2026-08-21", value: 51, unit: "EGP_per_USD", source_observed_at: null, fetched_at: "2026-08-21T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "BTC_USD", source_id: "crypto", source_symbol: "BTC-USD", market_date: "2026-08-21", value: 100, unit: "USD_per_BTC", source_observed_at: null, fetched_at: "2026-08-21T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
      { indicator_key: "BTC_USD", source_id: "crypto", source_symbol: "BTC-USD", market_date: "2026-08-22", value: 102, unit: "USD_per_BTC", source_observed_at: null, fetched_at: "2026-08-22T20:00:00Z", source_url: "https://example.test", observation_status: "validated" },
    ];
    expect(buildCompatibleChart(rows, ["USD_EGP", "BTC_USD"])).toMatchObject({ status: "insufficient_compatible_history", pointCount: 0, points: [] });
  });
});
