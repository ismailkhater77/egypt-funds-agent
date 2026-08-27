export const SMARTSCORE_WEIGHTS = { P: 30, R: 25, B: 25, C: 10, I: 10 } as const;
export type ComponentKey = keyof typeof SMARTSCORE_WEIGHTS;
export type InputStatus = "verified" | "assumed" | "unverified" | "null";
export type TrackRecord = "Emerging" | "Developing" | "Established";
export type DataConfidence = "High" | "Moderate" | "Limited" | "Insufficient";
export type DataTier = "Verified" | "Mixed" | "Limited" | "Unverified";

export type WeeklyReturn = { date: string; returnPct: number; inputStatus?: InputStatus };
export type BenchmarkInput = {
  key: string;
  role: "natural" | "opportunity";
  weight: number;
  weeklyReturns: WeeklyReturn[];
  inputStatus: InputStatus;
};
export type FundScoreInput = {
  fundId: string;
  category: string;
  reportDate: string;
  horizonReturns: Record<string, number | null>;
  weeklyReturns: WeeklyReturn[];
  riskFreeWeeklyReturns: WeeklyReturn[];
  benchmarks: BenchmarkInput[];
  inflationReturnPct: number | null;
  inflationStatus: InputStatus;
  inputStatuses: InputStatus[];
};
export type BenchmarkResult = {
  benchmarkKey: string;
  benchmarkRole: "natural" | "opportunity";
  inputStatus: InputStatus;
  returnPct: number | null;
  outperformancePct: number | null;
  downsideProtectionPct: number | null;
  consistencyPct: number | null;
  contributionScore: number | null;
  status: "calculated" | "unavailable" | "unaligned";
};
export type SmartScoreResult = {
  fundId: string;
  category: string;
  reportDate: string;
  smartScore: number | null;
  components: Record<ComponentKey, number | null>;
  effectiveWeights: Record<ComponentKey, number | null>;
  componentAvailability: Record<ComponentKey, boolean>;
  evidenceCoverage: Record<ComponentKey, number>;
  evidenceScore: number;
  dataConfidence: DataConfidence;
  dataTier: DataTier;
  trackRecord: TrackRecord;
  peerCohortSize: number | null;
  fallbackUsed: boolean;
  naturalBenchmark: string | null;
  rawRank: number | null;
  qualifiedRank: number | null;
  qualificationStatus: "qualified" | "not_yet_qualified" | "not_ranked";
  benchmarkResults: BenchmarkResult[];
  warnings: string[];
};

export type RiskMetrics = { volatility: number | null; sharpe: number | null; sortino: number | null; maxDrawdown: number | null };
type ConsistencyMetrics = { positiveShare: number | null; signPersistence: number | null; horizonPositiveShare: number | null };

const EPSILON = 0.0001;
const bounded = (value: number) => Math.max(0, Math.min(100, value));
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const stdev = (values: number[]) => {
  if (values.length < 2) return null;
  const average = mean(values)!;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
};
const percentile = (value: number, peers: number[], higherIsBetter = true) => {
  if (!peers.length) return null;
  const lower = peers.filter(peer => peer < value).length;
  const equal = peers.filter(peer => peer === value).length;
  const raw = ((lower + equal / 2) / peers.length) * 100;
  return higherIsBetter ? raw : 100 - raw;
};
const validReturns = (returns: WeeklyReturn[]) => returns.filter(item => Number.isFinite(item.returnPct)).sort((a, b) => a.date.localeCompare(b.date));
const validHorizonCount = (input: FundScoreInput) => Object.values(input.horizonReturns).filter((value): value is number => value !== null && Number.isFinite(value)).length;

export function classifyTrackRecord(weeklyCount: number): TrackRecord {
  if (weeklyCount < 13) return "Emerging";
  if (weeklyCount < 52) return "Developing";
  return "Established";
}

export function redistributeWeights(components: Record<ComponentKey, number | null>): Record<ComponentKey, number | null> {
  const available = (Object.keys(SMARTSCORE_WEIGHTS) as ComponentKey[]).filter(key => components[key] !== null);
  const availableWeight = available.reduce((sum, key) => sum + SMARTSCORE_WEIGHTS[key], 0);
  return (Object.keys(SMARTSCORE_WEIGHTS) as ComponentKey[]).reduce((weights, key) => {
    weights[key] = components[key] === null || availableWeight === 0 ? null : (SMARTSCORE_WEIGHTS[key] / availableWeight) * 100;
    return weights;
  }, {} as Record<ComponentKey, number | null>);
}

export function calculateRiskMetrics(input: FundScoreInput): RiskMetrics {
  const fund = validReturns(input.weeklyReturns);
  if (fund.length < 2) return { volatility: null, sharpe: null, sortino: null, maxDrawdown: null };
  const fundValues = fund.map(item => item.returnPct / 100);
  const volatility = stdev(fundValues);
  const riskFreeByDate = new Map(validReturns(input.riskFreeWeeklyReturns).map(item => [item.date, item.returnPct / 100]));
  const aligned = fund.map(item => ({ fund: item.returnPct / 100, riskFree: riskFreeByDate.get(item.date) })).filter((item): item is { fund: number; riskFree: number } => item.riskFree !== undefined);
  const excess = aligned.map(item => item.fund - item.riskFree);
  const excessMean = mean(excess);
  const downside = aligned.map(item => Math.min(0, item.fund - item.riskFree));
  const downsideDeviation = downside.length ? Math.sqrt(downside.reduce((sum, value) => sum + value ** 2, 0) / downside.length) : null;
  let nav = 1;
  let peak = 1;
  let maxDrawdown = 0;
  for (const weeklyReturn of fundValues) {
    nav *= 1 + weeklyReturn;
    peak = Math.max(peak, nav);
    maxDrawdown = Math.max(maxDrawdown, ((peak - nav) / peak) * 100);
  }
  return {
    volatility: volatility === null ? null : volatility * 100,
    sharpe: volatility !== null && volatility > EPSILON && excessMean !== null ? excessMean / volatility : null,
    sortino: downsideDeviation !== null && downsideDeviation > EPSILON && excessMean !== null ? excessMean / downsideDeviation : null,
    maxDrawdown,
  };
}

function calculateConsistencyMetrics(input: FundScoreInput): ConsistencyMetrics {
  const returns = validReturns(input.weeklyReturns).map(item => item.returnPct);
  const horizons = Object.values(input.horizonReturns).filter((value): value is number => value !== null && Number.isFinite(value));
  if (returns.length < 2) return { positiveShare: null, signPersistence: null, horizonPositiveShare: horizons.length ? horizons.filter(value => value > 0).length / horizons.length : null };
  const positiveShare = returns.filter(value => value > 0).length / returns.length;
  const signChanges = returns.slice(1).filter((value, index) => Math.sign(value) !== Math.sign(returns[index])).length;
  return { positiveShare, signPersistence: 1 - signChanges / (returns.length - 1), horizonPositiveShare: horizons.length ? horizons.filter(value => value > 0).length / horizons.length : null };
}

function alignedBenchmarkResult(input: FundScoreInput, benchmark: BenchmarkInput): BenchmarkResult {
  const fund = new Map(validReturns(input.weeklyReturns).map(item => [item.date, item.returnPct]));
  const comparison = validReturns(benchmark.weeklyReturns).map(item => ({ fund: fund.get(item.date), benchmark: item.returnPct })).filter((item): item is { fund: number; benchmark: number } => item.fund !== undefined);
  if (!comparison.length) return { benchmarkKey: benchmark.key, benchmarkRole: benchmark.role, inputStatus: benchmark.inputStatus, returnPct: null, outperformancePct: null, downsideProtectionPct: null, consistencyPct: null, contributionScore: null, status: benchmark.weeklyReturns.length ? "unaligned" : "unavailable" };
  const fundReturnPct = (comparison.reduce((total, item) => total * (1 + item.fund / 100), 1) - 1) * 100;
  const benchmarkReturnPct = (comparison.reduce((total, item) => total * (1 + item.benchmark / 100), 1) - 1) * 100;
  const downside = comparison.filter(item => item.benchmark < 0).map(item => item.fund - item.benchmark);
  const outperformancePct = fundReturnPct - benchmarkReturnPct;
  const downsideProtectionPct = mean(downside);
  const consistencyPct = comparison.filter(item => item.fund >= item.benchmark).length / comparison.length * 100;
  const measures = [bounded(50 + outperformancePct * 10), downsideProtectionPct === null ? null : bounded(50 + downsideProtectionPct * 10), consistencyPct].filter((value): value is number => value !== null);
  return { benchmarkKey: benchmark.key, benchmarkRole: benchmark.role, inputStatus: benchmark.inputStatus, returnPct: benchmarkReturnPct, outperformancePct, downsideProtectionPct, consistencyPct, contributionScore: mean(measures), status: "calculated" };
}

function weightedBenchmarkScore(results: BenchmarkResult[], inputs: BenchmarkInput[]): number | null {
  const available = results.filter(result => result.contributionScore !== null);
  const totalWeight = available.reduce((sum, result) => sum + (inputs.find(input => input.key === result.benchmarkKey)?.weight ?? 0), 0);
  if (!available.length || totalWeight <= 0) return null;
  return available.reduce((sum, result) => sum + result.contributionScore! * (inputs.find(input => input.key === result.benchmarkKey)?.weight ?? 0) / totalWeight, 0);
}

function componentEvidence(input: FundScoreInput, benchmarkResults: BenchmarkResult[]): Record<ComponentKey, number> {
  const weeklyCount = validReturns(input.weeklyReturns).length;
  const horizonCount = validHorizonCount(input);
  const benchmarkPossible = input.benchmarks.length;
  const benchmarkCalculated = benchmarkResults.filter(result => result.status === "calculated").length;
  return {
    P: bounded(horizonCount / 10 * 100),
    R: bounded(weeklyCount / 52 * 100),
    B: benchmarkPossible ? benchmarkCalculated / benchmarkPossible * 100 : 0,
    C: bounded(weeklyCount / 52 * 100),
    I: input.inflationReturnPct === null ? 0 : 100,
  };
}

function confidenceFor(evidenceScore: number): DataConfidence {
  if (evidenceScore >= 85) return "High";
  if (evidenceScore >= 70) return "Moderate";
  if (evidenceScore >= 40) return "Limited";
  return "Insufficient";
}

function tierFor(statuses: InputStatus[]): DataTier {
  if (!statuses.length || statuses.every(status => status === "unverified" || status === "null")) return "Unverified";
  if (statuses.some(status => status === "unverified")) return "Limited";
  if (statuses.some(status => status === "assumed")) return "Mixed";
  return "Verified";
}

function peerInputs(input: FundScoreInput, cohort: FundScoreInput[]) {
  const categoryPeers = cohort.filter(candidate => candidate.category === input.category);
  const similarAvailability = categoryPeers.filter(candidate => Math.abs(validHorizonCount(candidate) - validHorizonCount(input)) <= 1);
  return { peers: similarAvailability.length >= 3 ? similarAvailability : categoryPeers, fallbackUsed: similarAvailability.length < 3 };
}

export function evaluateSmartScoreCohort(inputs: FundScoreInput[]): SmartScoreResult[] {
  const riskByFund = new Map(inputs.map(input => [input.fundId, calculateRiskMetrics(input)]));
  const consistencyByFund = new Map(inputs.map(input => [input.fundId, calculateConsistencyMetrics(input)]));
  const preliminary: SmartScoreResult[] = inputs.map(input => {
    const { peers, fallbackUsed } = peerInputs(input, inputs);
    const warnings: string[] = [];
    const horizonScores = Object.entries(input.horizonReturns).flatMap(([horizon, value]) => {
      if (value === null || !Number.isFinite(value)) return [];
      const peerValues = peers.map(peer => peer.horizonReturns[horizon]).filter((candidate): candidate is number => candidate !== null && Number.isFinite(candidate));
      return peerValues.length ? [percentile(value, peerValues)!] : [];
    });
    const performanceScore = mean(horizonScores);
    const risk = riskByFund.get(input.fundId)!;
    const riskScores = ([
      ["volatility", false], ["sharpe", true], ["sortino", true], ["maxDrawdown", false],
    ] as const).flatMap(([metric, higherIsBetter]) => {
      const value = risk[metric];
      const peerValues = peers.map(peer => riskByFund.get(peer.fundId)![metric]).filter((candidate): candidate is number => candidate !== null);
      return value === null || !peerValues.length ? [] : [percentile(value, peerValues, higherIsBetter)!];
    });
    if (risk.volatility !== null && risk.volatility <= EPSILON * 100) warnings.push("near_zero_volatility");
    if (validReturns(input.weeklyReturns).some(item => Math.abs(item.returnPct) >= 20)) warnings.push("anomaly_candidate");
    const riskScore = mean(riskScores);
    const benchmarkResults = input.benchmarks.map(benchmark => alignedBenchmarkResult(input, benchmark));
    const benchmarkScore = weightedBenchmarkScore(benchmarkResults, input.benchmarks);
    const consistency = consistencyByFund.get(input.fundId)!;
    const consistencyScores = ([
      ["positiveShare", true], ["signPersistence", true],
      ["horizonPositiveShare", true],
    ] as const).flatMap(([metric, higherIsBetter]) => {
      const value = consistency[metric];
      const peerValues = peers.map(peer => consistencyByFund.get(peer.fundId)![metric]).filter((candidate): candidate is number => candidate !== null);
      return value === null || !peerValues.length ? [] : [percentile(value, peerValues, higherIsBetter)!];
    });
    const consistencyScore = mean(consistencyScores);
    const latestFundReturn = validReturns(input.weeklyReturns).at(-1)?.returnPct ?? null;
    const realReturn = latestFundReturn !== null && input.inflationReturnPct !== null ? ((1 + latestFundReturn / 100) / (1 + input.inflationReturnPct / 100) - 1) * 100 : null;
    const peerRealReturns = peers.map(peer => {
      const peerLatest = validReturns(peer.weeklyReturns).at(-1)?.returnPct ?? null;
      return peerLatest !== null && peer.inflationReturnPct !== null ? ((1 + peerLatest / 100) / (1 + peer.inflationReturnPct / 100) - 1) * 100 : null;
    }).filter((value): value is number => value !== null);
    const inflationScore = realReturn === null || !peerRealReturns.length ? null : percentile(realReturn, peerRealReturns);
    const components = { P: performanceScore, R: riskScore, B: benchmarkScore, C: consistencyScore, I: inflationScore };
    const effectiveWeights = redistributeWeights(components);
    const smartScore = (Object.keys(components) as ComponentKey[]).reduce((sum, key) => sum + (components[key] === null ? 0 : components[key]! * effectiveWeights[key]! / 100), 0);
    const hasAnyComponent = Object.values(components).some(value => value !== null);
    const evidenceCoverage = componentEvidence(input, benchmarkResults);
    const evidenceScore = mean(Object.values(evidenceCoverage))!;
    const inputStatuses = [...input.inputStatuses, input.inflationStatus, ...input.benchmarks.map(benchmark => benchmark.inputStatus)];
    if (input.inflationReturnPct === null) warnings.push("inflation_not_period_aligned");
    if (!benchmarkResults.some(result => result.status === "calculated")) warnings.push("no_period_aligned_benchmark");
    if (fallbackUsed) warnings.push("peer_cohort_fallback_used");
    return {
      fundId: input.fundId, category: input.category, reportDate: input.reportDate, smartScore: hasAnyComponent ? smartScore : null, components,
      effectiveWeights, componentAvailability: { P: performanceScore !== null, R: riskScore !== null, B: benchmarkScore !== null, C: consistencyScore !== null, I: inflationScore !== null },
      evidenceCoverage, evidenceScore, dataConfidence: confidenceFor(evidenceScore), dataTier: tierFor(inputStatuses), trackRecord: classifyTrackRecord(validReturns(input.weeklyReturns).length),
      peerCohortSize: peers.length || null, fallbackUsed, naturalBenchmark: input.benchmarks.find(benchmark => benchmark.role === "natural")?.key ?? null,
      rawRank: null, qualifiedRank: null, qualificationStatus: hasAnyComponent ? "not_yet_qualified" as const : "not_ranked" as const, benchmarkResults, warnings,
    };
  });
  for (const category of Array.from(new Set(preliminary.map(item => item.category)))) {
    const categoryItems = preliminary.filter(item => item.category === category && item.smartScore !== null).sort((a, b) => b.smartScore! - a.smartScore!);
    categoryItems.forEach((item, index) => { item.rawRank = index + 1; });
    const qualified = categoryItems.filter(item => item.evidenceScore >= 70 && (item.peerCohortSize ?? 0) >= 5 && item.dataTier !== "Limited" && item.dataTier !== "Unverified");
    qualified.forEach((item, index) => { item.qualifiedRank = index + 1; item.qualificationStatus = "qualified"; });
  }
  return preliminary;
}
