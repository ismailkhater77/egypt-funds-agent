type EvaluationRow = {
  evaluation_id: string; fund_id: string; report_date: string; category: string | null; methodology_version: string; smartscore: number | string | null;
  performance_score: number | string | null; risk_score: number | string | null; benchmark_score: number | string | null; consistency_score: number | string | null; inflation_score: number | string | null;
  evidence_score: number | string; data_confidence: string; data_tier: string; track_record: string; peer_cohort_size: number | null; fallback_used: boolean; natural_benchmark: string | null;
  raw_rank: number | null; qualified_rank: number | null; qualification_status: "qualified" | "not_yet_qualified" | "not_ranked"; warnings: string[]; effective_weights: Record<string, number | null>; input_status: Record<string, unknown>;
};
type FundRow = { fund_id: string; canonical_name: string };
type BenchmarkRow = { benchmark_key: string; benchmark_role: "natural" | "opportunity"; input_status: string; return_pct: number | string | null; outperformance_pct: number | string | null; downside_protection_pct: number | string | null; consistency_pct: number | string | null; contribution_score: number | string | null; status: string };

async function supabaseRead<T>(path: string): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<T>;
}

const numberOrNull = (value: number | string | null) => value === null ? null : Number(value);
function toPublicScore(row: EvaluationRow, name: string) {
  return {
    evaluationId: row.evaluation_id, fundId: row.fund_id, canonicalName: name, reportDate: row.report_date, category: row.category,
    methodologyVersion: row.methodology_version, smartScore: numberOrNull(row.smartscore), components: { P: numberOrNull(row.performance_score), R: numberOrNull(row.risk_score), B: numberOrNull(row.benchmark_score), C: numberOrNull(row.consistency_score), I: numberOrNull(row.inflation_score) },
    effectiveWeights: row.effective_weights, evidenceScore: Number(row.evidence_score), dataConfidence: row.data_confidence, dataTier: row.data_tier, trackRecord: row.track_record,
    peerCohortSize: row.peer_cohort_size, fallbackUsed: row.fallback_used, naturalBenchmark: row.natural_benchmark, rawRank: row.raw_rank, qualifiedRank: row.qualified_rank,
    qualificationStatus: row.qualification_status, inputStatus: row.input_status, warnings: row.warnings,
  };
}

export async function getLatestSmartScoreSnapshot() {
  const latest = await supabaseRead<Array<{ report_date: string; methodology_version: string }>>("/rest/v1/smartscore_evaluations?select=report_date,methodology_version&order=report_date.desc&limit=1");
  const anchor = latest[0];
  if (!anchor) return { reportDate: null, methodologyVersion: null, scores: [], summary: { evaluated: 0, qualified: 0, emerging: 0, highConfidence: 0 } };
  const [rows, funds] = await Promise.all([
    supabaseRead<EvaluationRow[]>(`/rest/v1/smartscore_evaluations?select=evaluation_id,fund_id,report_date,category,methodology_version,smartscore,performance_score,risk_score,benchmark_score,consistency_score,inflation_score,evidence_score,data_confidence,data_tier,track_record,peer_cohort_size,fallback_used,natural_benchmark,raw_rank,qualified_rank,qualification_status,warnings,effective_weights,input_status&report_date=eq.${anchor.report_date}&methodology_version=eq.${anchor.methodology_version}&order=raw_rank.asc.nullslast&limit=500`),
    supabaseRead<FundRow[]>("/rest/v1/funds?select=fund_id,canonical_name&active=eq.true&limit=500"),
  ]);
  const names = new Map(funds.map(fund => [fund.fund_id, fund.canonical_name]));
  const scores = rows.map(row => toPublicScore(row, names.get(row.fund_id) ?? row.fund_id));
  return { reportDate: anchor.report_date, methodologyVersion: anchor.methodology_version, scores, summary: { evaluated: scores.length, qualified: scores.filter(score => score.qualificationStatus === "qualified").length, emerging: scores.filter(score => score.trackRecord === "Emerging").length, highConfidence: scores.filter(score => score.dataConfidence === "High").length } };
}

export async function getSmartScoreDetail(fundId: string) {
  const rows = await supabaseRead<EvaluationRow[]>(`/rest/v1/smartscore_evaluations?select=evaluation_id,fund_id,report_date,category,methodology_version,smartscore,performance_score,risk_score,benchmark_score,consistency_score,inflation_score,evidence_score,data_confidence,data_tier,track_record,peer_cohort_size,fallback_used,natural_benchmark,raw_rank,qualified_rank,qualification_status,warnings,effective_weights,input_status,calculation_inputs&fund_id=eq.${encodeURIComponent(fundId)}&order=report_date.desc&limit=1`);
  const row = rows[0];
  if (!row) return null;
  const [funds, benchmarks] = await Promise.all([
    supabaseRead<FundRow[]>(`/rest/v1/funds?select=fund_id,canonical_name&fund_id=eq.${encodeURIComponent(fundId)}&limit=1`),
    supabaseRead<BenchmarkRow[]>(`/rest/v1/smartscore_benchmark_results?select=benchmark_key,benchmark_role,input_status,return_pct,outperformance_pct,downside_protection_pct,consistency_pct,contribution_score,status&evaluation_id=eq.${row.evaluation_id}&order=benchmark_role.asc,benchmark_key.asc&limit=20`),
  ]);
  const calculationInputs = (row as EvaluationRow & { calculation_inputs?: { benchmark_transparency?: unknown } }).calculation_inputs;
  return {
    ...toPublicScore(row, funds[0]?.canonical_name ?? row.fund_id),
    benchmarkTransparency: calculationInputs?.benchmark_transparency ?? null,
    benchmarkResults: benchmarks.map(item => ({
      benchmarkKey: item.benchmark_key,
      benchmarkRole: item.benchmark_role,
      inputStatus: item.input_status,
      returnPct: numberOrNull(item.return_pct),
      outperformancePct: numberOrNull(item.outperformance_pct),
      downsideProtectionPct: numberOrNull(item.downside_protection_pct),
      consistencyPct: numberOrNull(item.consistency_pct),
      contributionScore: numberOrNull(item.contribution_score),
      status: item.status,
    })),
  };
}
