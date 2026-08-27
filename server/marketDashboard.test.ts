import { describe, expect, it } from "vitest";
import { selectLatestMarketObservations, selectLatestVerifiedFundPrices } from "./marketDashboard";

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
});
