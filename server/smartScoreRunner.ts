import { evaluateSmartScoreCohort, type BenchmarkInput, type FundScoreInput, type InputStatus, type SmartScoreResult, type WeeklyReturn } from "./smartScore";

const METHODOLOGY_VERSION = "smartscore_v1.0";
const ALL_BENCHMARKS = ["EGX30", "SP500", "MSCI_EM", "USD", "GOLD", "SILVER", "BITCOIN", "TBILLS", "INFLATION"] as const;

type PerformanceRow = { fund_id: string; report_date: string; horizon: string; category: string | null; return_pct: number | string | null; identity_status: string; source_file: string | null; source_page: string | null };
type IndicatorRow = { indicator_key: string; report_date: string; value: number | string; reference_period: string | null };
type StoredEvaluation = { evaluation_id: string; fund_id: string; report_date: string };

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceRoleKey) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const body = await response.text();
  return (body ? JSON.parse(body) : null) as T;
}

async function supabaseReadPaged<T>(basePath: string, pageSize = 500): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const separator = basePath.includes("?") ? "&" : "?";
    const page = await supabaseFetch<T[]>(`${basePath}${separator}limit=${pageSize}&offset=${offset}`);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function isEquity(category: string) { return /equity|index|sectorial|thematic|exchange traded/i.test(category); }
function isDollar(category: string) { return /dollar|foreign currency/i.test(category); }
function isGold(category: string) { return /gold/i.test(category); }
function isLowRisk(category: string) { return /money market|fixed income|capital protected|capital guaranteed/i.test(category); }

function benchmarkWeights(category: string): Record<(typeof ALL_BENCHMARKS)[number], number> {
  if (isEquity(category)) return { EGX30: 0.55, SP500: 0.1, MSCI_EM: 0.1, USD: 0.1, GOLD: 0.05, SILVER: 0.025, BITCOIN: 0.025, TBILLS: 0.025, INFLATION: 0.025 };
  if (isGold(category)) return { EGX30: 0.05, SP500: 0.05, MSCI_EM: 0.05, USD: 0.1, GOLD: 0.6, SILVER: 0.05, BITCOIN: 0.025, TBILLS: 0.05, INFLATION: 0.025 };
  if (isDollar(category)) return { EGX30: 0.05, SP500: 0.1, MSCI_EM: 0.1, USD: 0.6, GOLD: 0.05, SILVER: 0.025, BITCOIN: 0.025, TBILLS: 0.025, INFLATION: 0.025 };
  if (isLowRisk(category)) return { EGX30: 0.05, SP500: 0.025, MSCI_EM: 0.025, USD: 0.15, GOLD: 0.075, SILVER: 0.025, BITCOIN: 0.025, TBILLS: 0.6, INFLATION: 0.025 };
  return { EGX30: 0.3, SP500: 0.075, MSCI_EM: 0.075, USD: 0.15, GOLD: 0.1, SILVER: 0.05, BITCOIN: 0.025, TBILLS: 0.2, INFLATION: 0.025 };
}

function naturalBenchmarkFor(category: string): (typeof ALL_BENCHMARKS)[number] {
  if (isGold(category)) return "GOLD";
  if (isDollar(category)) return "USD";
  if (isLowRisk(category)) return "TBILLS";
  return "EGX30";
}

function weeklyReturnsFromLevels(rows: IndicatorRow[], indicatorKey: string, status: InputStatus): WeeklyReturn[] {
  const levels = rows.filter(row => row.indicator_key === indicatorKey && Number(row.value) > 0).sort((a, b) => a.report_date.localeCompare(b.report_date));
  return levels.slice(1).map((row, index) => ({ date: row.report_date, returnPct: (Number(row.value) / Number(levels[index].value) - 1) * 100, inputStatus: status }));
}

function assumedTbillWeeklyReturns(rows: IndicatorRow[]): WeeklyReturn[] {
  const yields = rows.filter(row => row.indicator_key === "TBILL_YIELD_AVG" && Number(row.value) > 0).sort((a, b) => a.report_date.localeCompare(b.report_date));
  return yields.slice(1).map((row, index) => {
    const elapsedDays = Math.max(1, Math.round((Date.parse(row.report_date) - Date.parse(yields[index].report_date)) / 86_400_000));
    return { date: row.report_date, returnPct: ((1 + Number(yields[index].value) / 100) ** (elapsedDays / 365) - 1) * 100, inputStatus: "assumed" };
  });
}

function buildBenchmarks(category: string, indicators: IndicatorRow[]): BenchmarkInput[] {
  const natural = naturalBenchmarkFor(category);
  const weights = benchmarkWeights(category);
  const known: Partial<Record<(typeof ALL_BENCHMARKS)[number], { returns: WeeklyReturn[]; status: InputStatus }>> = {
    EGX30: { returns: weeklyReturnsFromLevels(indicators, "EGX30_CLOSE", "verified"), status: "verified" },
    USD: { returns: weeklyReturnsFromLevels(indicators, "FX_SELL_EGP_PER_UNIT", "verified"), status: "verified" },
    TBILLS: { returns: assumedTbillWeeklyReturns(indicators), status: "assumed" },
  };
  return ALL_BENCHMARKS.map(key => ({ key, role: key === natural ? "natural" : "opportunity", weight: weights[key], weeklyReturns: known[key]?.returns ?? [], inputStatus: known[key]?.status ?? "null" }));
}

function inflationFor(reportDate: string, indicators: IndicatorRow[]): { value: number | null; status: InputStatus } {
  // EIMA supplies a monthly observation repeated in weekly reports. It is not a period-aligned weekly inflation return, so I remains null rather than repeating it.
  const exactPeriod = indicators.find(row => row.indicator_key === "CPI_HEADLINE_PERIOD_ALIGNED" && row.report_date === reportDate);
  return exactPeriod ? { value: Number(exactPeriod.value), status: "verified" } : { value: null, status: "null" };
}

export function buildFundScoreInputs(rows: PerformanceRow[], indicators: IndicatorRow[], reportDate: string): FundScoreInput[] {
  const byFund = new Map<string, PerformanceRow[]>();
  for (const row of rows.filter(row => row.identity_status === "EXACT_ACTIVE" && row.fund_id)) byFund.set(row.fund_id, [...(byFund.get(row.fund_id) ?? []), row]);
  const inputs: Array<FundScoreInput | null> = Array.from(byFund.entries()).map(([fundId, fundRows]): FundScoreInput | null => {
    const category = fundRows.find(row => row.category)?.category ?? "Unclassified";
    const reportRows = fundRows.filter(row => row.report_date === reportDate);
    if (!reportRows.length) return null;
    const weeklyReturns: WeeklyReturn[] = fundRows.filter(row => row.horizon === "weekly" && row.return_pct !== null).map(row => ({ date: row.report_date, returnPct: Number(row.return_pct), inputStatus: "verified" }));
    const horizons = Object.fromEntries(reportRows.map(row => [row.horizon, row.return_pct === null ? null : Number(row.return_pct)]));
    const inflation = inflationFor(reportDate, indicators);
    return { fundId, category, reportDate, horizonReturns: horizons, weeklyReturns, riskFreeWeeklyReturns: assumedTbillWeeklyReturns(indicators), benchmarks: buildBenchmarks(category, indicators), inflationReturnPct: inflation.value, inflationStatus: inflation.status, inputStatuses: ["verified"] };
  });
  return inputs.filter((input): input is FundScoreInput => input !== null);
}

function evaluationPayload(result: SmartScoreResult) {
  return {
    fund_id: result.fundId, report_date: result.reportDate, category: result.category, methodology_version: METHODOLOGY_VERSION, smartscore: result.smartScore,
    performance_score: result.components.P, risk_score: result.components.R, benchmark_score: result.components.B, consistency_score: result.components.C, inflation_score: result.components.I,
    effective_weights: result.effectiveWeights, component_availability: result.componentAvailability, evidence_coverage: result.evidenceCoverage, evidence_score: result.evidenceScore,
    data_confidence: result.dataConfidence, data_tier: result.dataTier, track_record: result.trackRecord, peer_cohort_size: result.peerCohortSize, fallback_used: result.fallbackUsed,
    natural_benchmark: result.naturalBenchmark, raw_rank: result.rawRank, qualified_rank: result.qualifiedRank, qualification_status: result.qualificationStatus,
    input_status: { performance: "verified", risk_free: "assumed", benchmark_inputs: result.benchmarkResults.map(item => ({ key: item.benchmarkKey, status: item.inputStatus })), inflation: result.components.I === null ? "null" : "verified" },
    warnings: result.warnings, calculation_inputs: { methodology_version: METHODOLOGY_VERSION, component_formulae: ["P: peer percentile across available official horizons", "R: percentile across volatility, Sharpe, Sortino, and max drawdown", "B: aligned cumulative benchmark comparison", "C: weekly sign stability", "I: period-aligned real return"], source_provenance: ["EIMA official periodic reports", "EIMA report indicators"] },
  };
}

function chunks<T>(items: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) result.push(items.slice(index, index + chunkSize));
  return result;
}

async function persistResults(results: SmartScoreResult[]): Promise<void> {
  const stored: StoredEvaluation[] = [];
  for (const batch of chunks(results, 200)) {
    stored.push(...await supabaseFetch<StoredEvaluation[]>("/rest/v1/smartscore_evaluations?on_conflict=fund_id,report_date,methodology_version", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(batch.map(evaluationPayload)) }));
  }
  const evaluationIdByKey = new Map(stored.map(row => [`${row.fund_id}::${row.report_date}`, row.evaluation_id]));
  const benchmarks = results.flatMap(result => {
    const evaluationId = evaluationIdByKey.get(`${result.fundId}::${result.reportDate}`);
    if (!evaluationId) throw new Error(`SmartScore evaluation persistence did not return an identifier for ${result.fundId}`);
    return result.benchmarkResults.map(item => ({ evaluation_id: evaluationId, benchmark_key: item.benchmarkKey, benchmark_role: item.benchmarkRole, input_status: item.inputStatus, aligned_start_date: null, aligned_end_date: null, return_pct: item.returnPct, outperformance_pct: item.outperformancePct, downside_protection_pct: item.downsideProtectionPct, consistency_pct: item.consistencyPct, contribution_score: item.contributionScore, status: item.status, calculation_inputs: { period_aligned: item.status === "calculated" } }));
  });
  const evidence = results.flatMap(result => {
    const evaluationId = evaluationIdByKey.get(`${result.fundId}::${result.reportDate}`)!;
    return Object.entries(result.evidenceCoverage).map(([key, value]) => ({ evaluation_id: evaluationId, metric_key: `evidence_${key}`, metric_value: value, unit: "score_0_100", input_status: value > 0 ? "verified" : "null", aligned_start_date: null, aligned_end_date: null, source_count: value > 0 ? 1 : 0, source_summary: ["EIMA official periodic reports"] }));
  });
  for (const batch of chunks(benchmarks, 500)) await supabaseFetch("/rest/v1/smartscore_benchmark_results?on_conflict=evaluation_id,benchmark_key", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(batch) });
  for (const batch of chunks(evidence, 500)) await supabaseFetch("/rest/v1/smartscore_metric_evidence?on_conflict=evaluation_id,metric_key", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(batch) });
}

export async function runSmartScoreEvaluation(reportDate?: string) {
  await supabaseFetch("/rest/v1/smartscore_methodology_versions?on_conflict=methodology_version", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ methodology_version: METHODOLOGY_VERSION, display_name: "SmartScore v1.0", weights: { P: 30, R: 25, B: 25, C: 10, I: 10 }, rules: { missing_data: "null_with_proportional_reweighting", evidence_is_multiplier: false, period_alignment: "exact" }, documentation_path: "reports/smartscore-methodology-v1.md", active: true }) });
  const [reports, performance, indicators] = await Promise.all([
    supabaseReadPaged<{ report_date: string }>("/rest/v1/eima_reports?select=report_date&order=report_date.asc"),
    supabaseReadPaged<PerformanceRow>("/rest/v1/fund_performance_history?select=fund_id,report_date,horizon,category,return_pct,identity_status,source_file,source_page&identity_status=eq.EXACT_ACTIVE&order=fund_id.asc,report_date.asc"),
    supabaseReadPaged<IndicatorRow>("/rest/v1/eima_report_indicators?select=indicator_key,report_date,value,reference_period&order=report_date.asc"),
  ]);
  const selectedDates = reportDate ? [reportDate] : reports.map(report => report.report_date);
  if (!selectedDates.length) throw new Error("No EIMA report is available for SmartScore evaluation");
  const results = selectedDates.flatMap(date => evaluateSmartScoreCohort(buildFundScoreInputs(performance, indicators, date)));
  await persistResults(results);
  return { methodologyVersion: METHODOLOGY_VERSION, reportDates: selectedDates, evaluatedFunds: results.length, scoredFunds: results.filter(result => result.smartScore !== null).length, qualifiedFunds: results.filter(result => result.qualificationStatus === "qualified").length, notYetQualifiedFunds: results.filter(result => result.qualificationStatus === "not_yet_qualified").length };
}
