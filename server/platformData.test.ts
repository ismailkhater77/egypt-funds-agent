import { describe, expect, it } from "vitest";
import { buildExecutiveSignal, buildUniverseFunds, buildVisualizationReadiness, deriveBenchmarkCriteria, deriveFundType, deriveResearchSignals } from "./platformData";

describe("platform fund universe", () => {
  it("derives product fund types deterministically from the stored category", () => {
    expect(deriveFundType("Open End- Money Market Funds")).toBe("سوق نقد");
    expect(deriveFundType("Open End - Gold Funds")).toBe("ذهب");
    expect(deriveFundType(null)).toBe("غير مصنف");
  });

  it("keeps unavailable fields null and excludes future NAV snapshots", () => {
    const items = buildUniverseFunds(
      [{ fund_id: "fund-a", canonical_name: "Fund A", management_company_raw: null, category: null, active: true }],
      [{ fund_id: "fund-a", nav: 10, currency: "EGP", valuation_date: "2026-08-30", collected_at: "2026-08-27T00:00:00Z", status: "validated" }],
      [], [], [], "2026-08-27",
    );
    expect(items[0]).toMatchObject({ latestNav: null, valuationDate: null, smartScore: null, dataAvailability: "limited", verifiedSnapshot: false });
    expect(items[0].returns.ytd).toBeNull();
  });

  it("derives evidence-aware research labels without converting them to recommendations", () => {
    const signals = deriveResearchSignals({ components: { P: 85, R: 80, B: 78, C: 76, I: null }, evidenceScore: 60, scoreDelta: 6, trackRecord: "Developing", warnings: [] });
    expect(signals).toEqual(expect.arrayContaining(["high_performance", "risk_quality", "benchmark_strength", "consistent", "rising"]));
    expect(signals).not.toContain("low_evidence");
  });

  it("flags limited evidence and anomaly candidates explicitly", () => {
    const signals = deriveResearchSignals({ components: { P: 95, R: 90, B: null, C: 90, I: null }, evidenceScore: 20, scoreDelta: 9, trackRecord: "Emerging", warnings: ["anomaly_candidate"] });
    expect(signals).toEqual(expect.arrayContaining(["new_fund", "low_evidence", "anomaly_review"]));
    expect(signals).not.toContain("high_performance");
    expect(signals).not.toContain("rising");
  });

  it("keeps the executive verdict evidence-aware and non-prescriptive", () => {
    const signal = buildExecutiveSignal({
      fundId:"a", canonicalName:"A", manager:null, category:"Equity", fundType:"أسهم ومؤشرات", currency:"EGP", active:true,
      latestNav:10, valuationDate:"2026-08-20", reportDate:"2026-07-30", returns:{}, smartScore:74,
      components:{P:85,R:78,B:72,C:60,I:null}, evidenceScore:64, dataConfidence:"Moderate", dataTier:"Mixed", trackRecord:"Developing",
      naturalBenchmark:"EGX30", rawRank:2, qualifiedRank:null, qualificationStatus:"not_yet_qualified", scoreDelta:2, dataAvailability:"partial",
      verifiedSnapshot:true, researchSignals:[], warnings:["inflation_not_period_aligned"],
    });
    expect(signal.profile).toBe("strong_multi_factor");
    expect(signal.strengths).toEqual(expect.arrayContaining(["الأداء", "العائد المعدل بالمخاطر", "مقارنة المرجع"]));
    expect(signal.watchItems).toContain("العائد الحقيقي غير محسوب لغياب تضخم مواءم زمنيًا");
  });

  it("does not fabricate a verdict when the score is unavailable", () => {
    expect(buildExecutiveSignal(null)).toMatchObject({ profile:"insufficient_evidence", evidenceQuality:"Insufficient" });
  });

  it("allows visual series only with at least two verified points and explicit score-performance overlap", () => {
    const readiness = buildVisualizationReadiness(
      [{ date: "2026-01-01", value: 10 }, { date: "2026-01-08", value: 10.2 }],
      [{ date: "2026-01-08", value: 1.2 }, { date: "2026-01-15", value: 0.8 }],
      [{ date: "2026-01-08", value: 62 }, { date: "2026-01-15", value: 63 }],
    );
    expect(readiness.nav).toMatchObject({ supported: true, pointCount: 2 });
    expect(readiness.alignedPerformanceScore).toMatchObject({ supported: true, pointCount: 2, firstDate: "2026-01-08" });
  });

  it("suppresses partial or non-overlapping visualization series rather than creating points", () => {
    const readiness = buildVisualizationReadiness(
      [{ date: "2026-01-01", value: 10 }],
      [{ date: "2026-01-08", value: 1.2 }, { date: "2026-01-15", value: 0.8 }],
      [{ date: "2026-02-01", value: 62 }, { date: "2026-02-08", value: 63 }],
    );
    expect(readiness.nav).toMatchObject({ supported: false, pointCount: 1 });
    expect(readiness.alignedPerformanceScore).toMatchObject({ supported: false, pointCount: 0 });
    expect(readiness.alignedPerformanceScore.reason).toContain("تقاطع زمني");
  });

  it("enables only benchmark lenses backed by multiple exact stored report dates", () => {
    const criteria = deriveBenchmarkCriteria([
      { indicator_key: "EGX30_CLOSE", report_date: "2026-01-01", value: 100 },
      { indicator_key: "EGX30_CLOSE", report_date: "2026-01-08", value: 105 },
      { indicator_key: "FX_SELL_EGP_PER_UNIT", report_date: "2026-01-01", value: 50 },
      { indicator_key: "TBILL_YIELD_AVG", report_date: "2026-01-01", value: 20 },
    ]);
    expect(criteria.find((item) => item.id === "egx30")).toMatchObject({ state: "ready", mode: "filter", observations: 2 });
    expect(criteria.find((item) => item.id === "usd_egp")).toMatchObject({ state: "unavailable", mode: "context", observations: 1 });
    expect(criteria.find((item) => item.id === "tbills")).toMatchObject({ state: "unavailable", mode: "context", observations: 1 });
  });

  it("keeps inflation and unsupported market lenses visible but outside deterministic filtering", () => {
    const criteria = deriveBenchmarkCriteria([{ indicator_key: "CPI_HEADLINE_MONTHLY_CHANGE", report_date: "2026-01-01", value: 1.3 }]);
    expect(criteria.find((item) => item.id === "inflation")).toMatchObject({ state: "unavailable", mode: "context" });
    expect(criteria.find((item) => item.id === "msci_em_egp")).toMatchObject({ state: "unavailable", mode: "context", observations: 1 });
  });
});
