import { describe, expect, it } from "vitest";
import { buildExecutiveSignal, buildUniverseFunds, deriveFundType, deriveResearchSignals } from "./platformData";

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
});
