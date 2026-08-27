import { describe, expect, it } from "vitest";
import { evaluateSmartScoreCohort, redistributeWeights, SMARTSCORE_WEIGHTS, type FundScoreInput } from "./smartScore";

function input(fundId: string, weekly: number[], ytd: number | null, options: Partial<FundScoreInput> = {}): FundScoreInput {
  const dates = weekly.map((_, index) => `2026-07-${String(index + 1).padStart(2, "0")}`);
  return {
    fundId, category: "Open End- Equity Funds", reportDate: "2026-07-30", horizonReturns: { weekly: weekly.at(-1) ?? null, ytd, last12m: ytd === null ? null : ytd * 2 },
    weeklyReturns: weekly.map((returnPct, index) => ({ date: dates[index], returnPct, inputStatus: "verified" })),
    riskFreeWeeklyReturns: weekly.map((_, index) => ({ date: dates[index], returnPct: 0.1, inputStatus: "assumed" })),
    benchmarks: [{ key: "EGX30", role: "natural", weight: 1, weeklyReturns: weekly.map((_, index) => ({ date: dates[index], returnPct: 0.5, inputStatus: "verified" })), inputStatus: "verified" }],
    inflationReturnPct: 0.2, inflationStatus: "verified", inputStatuses: ["verified"], ...options,
  };
}

describe("SmartScore v1", () => {
  it("preserves immutable component weights and redistributes only unavailable components", () => {
    expect(SMARTSCORE_WEIGHTS).toEqual({ P: 30, R: 25, B: 25, C: 10, I: 10 });
    const weights = redistributeWeights({ P: 80, R: null, B: 60, C: null, I: 50 });
    expect(weights.R).toBeNull();
    expect(weights.C).toBeNull();
    expect(Object.values(weights).filter((value): value is number => value !== null).reduce((sum, value) => sum + value, 0)).toBeCloseTo(100, 8);
    expect(weights.P).toBeCloseTo(46.153846, 5);
  });

  it("scores an emerging fund on its available evidence without penalizing absent long horizons", () => {
    const results = evaluateSmartScoreCohort([
      input("new", [1, 1.2], 3), input("peer-a", [0.5, 0.6], 2), input("peer-b", [0.2, 0.3], 1), input("peer-c", [-0.2, 0.1], 0), input("peer-d", [0.1, 0.2], 0.5),
    ]);
    const emerging = results.find(result => result.fundId === "new")!;
    expect(emerging.trackRecord).toBe("Emerging");
    expect(emerging.smartScore).not.toBeNull();
    expect(emerging.components.P).not.toBeNull();
    expect(emerging.rawRank).toBeTypeOf("number");
    expect(emerging.effectiveWeights.P).not.toBe(0);
  });

  it("returns null for unavailable components and reallocates their weights instead of using zero", () => {
    const results = evaluateSmartScoreCohort([
      input("a", [1, 2], 3, { benchmarks: [], inflationReturnPct: null, inflationStatus: "null" }),
      input("b", [0.5, 1], 2, { benchmarks: [], inflationReturnPct: null, inflationStatus: "null" }),
      input("c", [0.2, 0.6], 1, { benchmarks: [], inflationReturnPct: null, inflationStatus: "null" }),
    ]);
    const result = results[0];
    expect(result.components.B).toBeNull();
    expect(result.components.I).toBeNull();
    expect(result.effectiveWeights.B).toBeNull();
    expect(result.effectiveWeights.I).toBeNull();
    expect(result.smartScore).not.toBeNull();
    expect(Object.values(result.effectiveWeights).filter((value): value is number => value !== null).reduce((sum, value) => sum + value, 0)).toBeCloseTo(100, 8);
  });

  it("flags near-zero volatility and large returns as review candidates without suppressing the observation", () => {
    const results = evaluateSmartScoreCohort([
      input("a", [25, 25], 30), input("b", [0.5, 1], 2), input("c", [0.2, 0.6], 1),
    ]);
    const result = results.find(item => item.fundId === "a")!;
    expect(result.warnings).toContain("near_zero_volatility");
    expect(result.warnings).toContain("anomaly_candidate");
    expect(result.smartScore).not.toBeNull();
  });

  it("classifies a 52-week history as established without changing the fixed scoring weights", () => {
    const established = input("established", Array.from({ length: 52 }, () => 0.8), 15);
    const peers = Array.from({ length: 5 }, (_, index) => input(`peer-${index}`, Array.from({ length: 52 }, () => 0.2 + index / 10), 5 + index));
    const result = evaluateSmartScoreCohort([established, ...peers]).find(item => item.fundId === "established")!;
    expect(result.trackRecord).toBe("Established");
    expect(result.effectiveWeights).toMatchObject({ P: 30, R: 25, B: 25, C: 10, I: 10 });
  });

  it("retains a raw performance rank even when the evidence threshold prevents qualified ranking", () => {
    const results = evaluateSmartScoreCohort([
      input("strong-but-thin", [2, 2.2], 9), input("peer-a", [0.5, 0.7], 3), input("peer-b", [0.2, 0.3], 2), input("peer-c", [0.1, 0.2], 1), input("peer-d", [-0.1, 0.1], 0),
    ]);
    const result = results.find(item => item.fundId === "strong-but-thin")!;
    expect(result.rawRank).toBe(1);
    expect(result.qualifiedRank).toBeNull();
    expect(result.qualificationStatus).toBe("not_yet_qualified");
    expect(result.dataConfidence).not.toBe("High");
  });

  it("uses only the period-aligned benchmark observations and marks an unaligned benchmark explicitly", () => {
    const results = evaluateSmartScoreCohort([
      input("a", [1, 2], 3, { benchmarks: [{ key: "EGX30", role: "natural", weight: 1, weeklyReturns: [{ date: "2026-06-01", returnPct: 1 }], inputStatus: "verified" }] }),
      input("b", [0.5, 1], 2, { benchmarks: [] }), input("c", [0.2, 0.6], 1, { benchmarks: [] }),
    ]);
    const benchmark = results.find(item => item.fundId === "a")!.benchmarkResults[0];
    expect(benchmark.status).toBe("unaligned");
    expect(benchmark.contributionScore).toBeNull();
  });
});
