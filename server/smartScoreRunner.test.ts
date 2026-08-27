import { describe, expect, it } from "vitest";
import { buildFundScoreInputs } from "./smartScoreRunner";

describe("SmartScore input builder", () => {
  it("keeps all opportunity benchmarks while preserving unavailable inputs as explicit null", () => {
    const performance = [
      { fund_id: "fund-a", report_date: "2026-07-23", horizon: "weekly", category: "Open End- Equity Funds", return_pct: "1.0", identity_status: "EXACT_ACTIVE", source_file: "eima.csv", source_page: null },
      { fund_id: "fund-a", report_date: "2026-07-30", horizon: "weekly", category: "Open End- Equity Funds", return_pct: "2.0", identity_status: "EXACT_ACTIVE", source_file: "eima.csv", source_page: null },
      { fund_id: "fund-a", report_date: "2026-07-30", horizon: "ytd", category: "Open End- Equity Funds", return_pct: "15.0", identity_status: "EXACT_ACTIVE", source_file: "eima.csv", source_page: null },
      { fund_id: "fund-b", report_date: "2026-07-23", horizon: "weekly", category: "Open End- Equity Funds", return_pct: "0.5", identity_status: "EXACT_ACTIVE", source_file: "eima.csv", source_page: null },
    ];
    const indicators = [
      { indicator_key: "EGX30_CLOSE", report_date: "2026-07-23", value: "100", reference_period: null },
      { indicator_key: "EGX30_CLOSE", report_date: "2026-07-30", value: "102", reference_period: null },
      { indicator_key: "FX_SELL_EGP_PER_UNIT", report_date: "2026-07-23", value: "50", reference_period: null },
      { indicator_key: "FX_SELL_EGP_PER_UNIT", report_date: "2026-07-30", value: "51", reference_period: null },
      { indicator_key: "TBILL_YIELD_AVG", report_date: "2026-07-23", value: "20", reference_period: null },
      { indicator_key: "TBILL_YIELD_AVG", report_date: "2026-07-30", value: "20", reference_period: null },
    ];
    const inputs = buildFundScoreInputs(performance, indicators, "2026-07-30");
    expect(inputs).toHaveLength(1);
    expect(inputs[0].weeklyReturns).toHaveLength(2);
    expect(inputs[0].horizonReturns).toEqual({ weekly: 2, ytd: 15 });
    expect(inputs[0].benchmarks).toHaveLength(9);
    expect(inputs[0].benchmarks.find(benchmark => benchmark.key === "EGX30")).toMatchObject({ role: "natural", inputStatus: "verified" });
    expect(inputs[0].benchmarks.find(benchmark => benchmark.key === "SP500")).toMatchObject({ inputStatus: "null", weeklyReturns: [] });
    expect(inputs[0].inflationReturnPct).toBeNull();
  });
});
