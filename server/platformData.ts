type FundRow = { fund_id: string; canonical_name: string; management_company_raw: string | null; category: string | null; active: boolean };
type PriceRow = { fund_id: string; nav: number | string; currency: string; valuation_date: string; collected_at: string; status: string };
type PerformanceRow = { fund_id: string; report_date: string; horizon: string; return_pct: number | string | null; currency: string | null; identity_status: string | null };
type ScoreRow = {
  fund_id: string; report_date: string; smartscore: number | string | null; performance_score: number | string | null; risk_score: number | string | null;
  benchmark_score: number | string | null; consistency_score: number | string | null; inflation_score: number | string | null; evidence_score: number | string;
  data_confidence: string; data_tier: string; track_record: string; natural_benchmark: string | null; raw_rank: number | null; qualified_rank: number | null; qualification_status: string; warnings: string[];
};

export type ResearchSignal = "high_performance" | "risk_quality" | "benchmark_strength" | "consistent" | "rising" | "new_fund" | "low_evidence" | "anomaly_review";
export type UniverseFund = {
  fundId: string; canonicalName: string; manager: string | null; category: string | null; fundType: string; currency: string | null; active: boolean;
  latestNav: number | null; valuationDate: string | null; reportDate: string | null; returns: Record<string, number | null>;
  smartScore: number | null; components: Record<"P" | "R" | "B" | "C" | "I", number | null>; evidenceScore: number | null; dataConfidence: string | null;
  dataTier: string | null; trackRecord: string | null; naturalBenchmark: string | null; rawRank: number | null; qualifiedRank: number | null; qualificationStatus: string | null;
  scoreDelta: number | null; dataAvailability: "complete" | "partial" | "limited"; verifiedSnapshot: boolean; researchSignals: ResearchSignal[]; warnings: string[];
};

type EvaluationHistoryRow = { report_date: string; smartscore: number | string | null; performance_score: number | string | null; risk_score: number | string | null; benchmark_score: number | string | null; consistency_score: number | string | null; inflation_score: number | string | null; evidence_score: number | string; raw_rank: number | null; qualified_rank: number | null; qualification_status: string; data_confidence: string; data_tier: string; track_record: string; warnings: string[] };
type IndicatorRow = { indicator_key: string; report_date: string; value: number | string };

async function supabaseRead<T>(path: string): Promise<T> {
  const baseUrl = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
  const response = await fetch(`${baseUrl}${path}`, { headers: { apikey: secret, Authorization: `Bearer ${secret}` } });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<T>;
}

const numeric = (value: number | string | null | undefined) => value === null || value === undefined ? null : Number(value);
const cairoDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export function deriveFundType(category: string | null): string {
  const value = category?.toLowerCase() ?? "";
  if (!value) return "غير مصنف";
  if (value.includes("money market")) return "سوق نقد";
  if (value.includes("fixed income")) return "دخل ثابت";
  if (value.includes("equity") || value.includes("index") || value.includes("exchange traded")) return "أسهم ومؤشرات";
  if (value.includes("gold")) return "ذهب";
  if (value.includes("balanced") || value.includes("mixed") || value.includes("allocator") || value.includes("fund of funds")) return "متوازن ومتعدد الأصول";
  if (value.includes("protected") || value.includes("guaranteed")) return "حماية رأس المال";
  if (value.includes("charitable")) return "خيري";
  if (value.includes("real estate")) return "عقاري";
  return "متخصص";
}

export function deriveResearchSignals(fund: Pick<UniverseFund, "components" | "evidenceScore" | "scoreDelta" | "trackRecord" | "warnings">): ResearchSignal[] {
  const signals: ResearchSignal[] = [];
  if ((fund.components.P ?? -1) >= 80 && (fund.evidenceScore ?? 0) >= 35) signals.push("high_performance");
  if ((fund.components.R ?? -1) >= 75 && (fund.evidenceScore ?? 0) >= 35) signals.push("risk_quality");
  if ((fund.components.B ?? -1) >= 75 && (fund.evidenceScore ?? 0) >= 35) signals.push("benchmark_strength");
  if ((fund.components.C ?? -1) >= 75 && (fund.evidenceScore ?? 0) >= 35) signals.push("consistent");
  if ((fund.scoreDelta ?? 0) >= 5 && !fund.warnings.includes("anomaly_candidate")) signals.push("rising");
  if (fund.trackRecord === "Emerging") signals.push("new_fund");
  if ((fund.evidenceScore ?? 0) < 40) signals.push("low_evidence");
  if (fund.warnings.includes("anomaly_candidate") || fund.warnings.includes("near_zero_volatility")) signals.push("anomaly_review");
  return signals;
}

export function buildUniverseFunds(funds: FundRow[], prices: PriceRow[], latestScores: ScoreRow[], priorScores: ScoreRow[], performance: PerformanceRow[], asOfDate: string): UniverseFund[] {
  const latestPrice = new Map<string, PriceRow>();
  for (const row of prices) {
    if (row.status !== "validated" || row.valuation_date > asOfDate) continue;
    const current = latestPrice.get(row.fund_id);
    if (!current || row.valuation_date > current.valuation_date || (row.valuation_date === current.valuation_date && row.collected_at > current.collected_at)) latestPrice.set(row.fund_id, row);
  }
  const latestByFund = new Map(latestScores.map(row => [row.fund_id, row]));
  const priorByFund = new Map(priorScores.map(row => [row.fund_id, row]));
  const performanceByFund = new Map<string, PerformanceRow[]>();
  for (const row of performance) performanceByFund.set(row.fund_id, [...(performanceByFund.get(row.fund_id) ?? []), row]);
  return funds.map(fund => {
    const price = latestPrice.get(fund.fund_id);
    const score = latestByFund.get(fund.fund_id);
    const prior = priorByFund.get(fund.fund_id);
    const perf = performanceByFund.get(fund.fund_id) ?? [];
    const returns = Object.fromEntries(["weekly", "4weeks", "ytd", "last12m", "1y", "2y", "3y", "4y", "5y", "6y"].map(horizon => [horizon, numeric(perf.find(row => row.horizon === horizon)?.return_pct)]));
    const evidenceScore = numeric(score?.evidence_score);
    const smartScore = numeric(score?.smartscore);
    const components = { P: numeric(score?.performance_score), R: numeric(score?.risk_score), B: numeric(score?.benchmark_score), C: numeric(score?.consistency_score), I: numeric(score?.inflation_score) };
    const dataAvailability = price && score && (evidenceScore ?? 0) >= 70 ? "complete" : price || score || perf.length ? "partial" : "limited";
    const item: UniverseFund = {
      fundId: fund.fund_id, canonicalName: fund.canonical_name, manager: fund.management_company_raw, category: fund.category, fundType: deriveFundType(fund.category), currency: price?.currency ?? perf.find(row => row.currency)?.currency ?? null,
      active: fund.active, latestNav: numeric(price?.nav), valuationDate: price?.valuation_date ?? null, reportDate: score?.report_date ?? perf[0]?.report_date ?? null, returns,
      smartScore, components, evidenceScore, dataConfidence: score?.data_confidence ?? null, dataTier: score?.data_tier ?? null, trackRecord: score?.track_record ?? null,
      naturalBenchmark: score?.natural_benchmark ?? null, rawRank: score?.raw_rank ?? null, qualifiedRank: score?.qualified_rank ?? null, qualificationStatus: score?.qualification_status ?? null,
      scoreDelta: smartScore !== null && numeric(prior?.smartscore) !== null ? smartScore - numeric(prior?.smartscore)! : null,
      dataAvailability, verifiedSnapshot: Boolean(price), researchSignals: [], warnings: score?.warnings ?? [],
    };
    item.researchSignals = deriveResearchSignals(item);
    return item;
  });
}

async function buildFundUniverseSnapshot() {
  const reportDates = await supabaseRead<Array<{ report_date: string }>>("/rest/v1/eima_reports?select=report_date&order=report_date.desc&limit=2");
  const latestDate = reportDates[0]?.report_date ?? null;
  const priorDate = reportDates[1]?.report_date ?? null;
  const scoreSelect = "fund_id,report_date,smartscore,performance_score,risk_score,benchmark_score,consistency_score,inflation_score,evidence_score,data_confidence,data_tier,track_record,natural_benchmark,raw_rank,qualified_rank,qualification_status,warnings";
  const [funds, prices, latestScores, priorScores, performance] = await Promise.all([
    supabaseRead<FundRow[]>("/rest/v1/funds?select=fund_id,canonical_name,management_company_raw,category,active&order=canonical_name.asc&limit=500"),
    supabaseRead<PriceRow[]>(`/rest/v1/fund_prices?select=fund_id,nav,currency,valuation_date,collected_at,status&status=eq.validated&valuation_date=lte.${cairoDate()}&order=valuation_date.desc,collected_at.desc&limit=1000`),
    latestDate ? supabaseRead<ScoreRow[]>(`/rest/v1/smartscore_evaluations?select=${scoreSelect}&report_date=eq.${latestDate}&order=raw_rank.asc.nullslast&limit=500`) : Promise.resolve([]),
    priorDate ? supabaseRead<ScoreRow[]>(`/rest/v1/smartscore_evaluations?select=${scoreSelect}&report_date=eq.${priorDate}&limit=500`) : Promise.resolve([]),
    latestDate ? supabaseRead<PerformanceRow[]>(`/rest/v1/fund_performance_history?select=fund_id,report_date,horizon,return_pct,currency,identity_status&report_date=eq.${latestDate}&identity_status=eq.EXACT_ACTIVE&limit=2500`) : Promise.resolve([]),
  ]);
  const items = buildUniverseFunds(funds, prices, latestScores, priorScores, performance, cairoDate());
  const unique = (values: Array<string | null>) => Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
  return {
    asOfDate: cairoDate(), reportDate: latestDate, priorReportDate: priorDate, items,
    facets: { categories: unique(items.map(item => item.category)), managers: unique(items.map(item => item.manager)), fundTypes: unique(items.map(item => item.fundType)), currencies: unique(items.map(item => item.currency)), trackRecords: unique(items.map(item => item.trackRecord)), dataAvailability: ["complete", "partial", "limited"] as const },
    summary: { total: items.length, active: items.filter(item => item.active).length, withCurrentNav: items.filter(item => item.verifiedSnapshot).length, scored: items.filter(item => item.smartScore !== null).length, emerging: items.filter(item => item.trackRecord === "Emerging").length },
  };
}

type FundUniverseSnapshot = Awaited<ReturnType<typeof buildFundUniverseSnapshot>>;
let universeCache: { expiresAt: number; data: FundUniverseSnapshot } | null = null;

export async function getFundUniverseSnapshot(): Promise<FundUniverseSnapshot> {
  if (universeCache && universeCache.expiresAt > Date.now()) return universeCache.data;
  const data = await buildFundUniverseSnapshot();
  universeCache = { expiresAt: Date.now() + 5 * 60 * 1000, data };
  return data;
}

export async function getDiscoverSnapshot() {
  const universe = await getFundUniverseSnapshot();
  const scored = universe.items.filter(item => item.smartScore !== null);
  const byCategory = new Map<string, UniverseFund[]>();
  for (const item of scored) byCategory.set(item.category ?? "غير مصنف", [...(byCategory.get(item.category ?? "غير مصنف") ?? []), item]);
  const categoryLeaders = Array.from(byCategory.entries()).map(([category, items]) => ({ category, fund: [...items].sort((a, b) => (b.smartScore ?? -1) - (a.smartScore ?? -1))[0], peerCount: items.length })).sort((a, b) => (b.fund.smartScore ?? -1) - (a.fund.smartScore ?? -1));
  const order = (items: UniverseFund[], selector: (item: UniverseFund) => number | null, limit = 12) => [...items].filter(item => selector(item) !== null).sort((a, b) => selector(b)! - selector(a)!).slice(0, limit);
  return {
    asOfDate: universe.asOfDate, reportDate: universe.reportDate,
    categoryLeaders, topPerformers: order(scored.filter(item => (item.evidenceScore ?? 0) >= 35), item => item.components.P),
    risingFunds: order(scored.filter(item => !item.warnings.includes("anomaly_candidate")), item => item.scoreDelta),
    newFunds: scored.filter(item => item.trackRecord === "Emerging").sort((a, b) => (b.evidenceScore ?? -1) - (a.evidenceScore ?? -1)),
    opportunityScanner: scored.filter(item => item.researchSignals.some(signal => ["high_performance", "risk_quality", "benchmark_strength", "consistent", "rising"].includes(signal))).sort((a, b) => (b.evidenceScore ?? -1) - (a.evidenceScore ?? -1)).slice(0, 24),
  };
}

export function buildExecutiveSignal(score: UniverseFund | null) {
  if (!score || score.smartScore === null) return { profile: "insufficient_evidence", strengths: [] as string[], watchItems: ["لا توجد نتيجة SmartScore قابلة للتفسير لهذا الصندوق"], evidenceQuality: "Insufficient" };
  const componentLabels: Record<"P" | "R" | "B" | "C" | "I", string> = { P: "الأداء", R: "العائد المعدل بالمخاطر", B: "مقارنة المرجع", C: "الاتساق", I: "العائد الحقيقي" };
  const strengths = (Object.keys(componentLabels) as Array<keyof typeof componentLabels>).filter(key => (score.components[key] ?? -1) >= 70).map(key => componentLabels[key]);
  const weak = (Object.keys(componentLabels) as Array<keyof typeof componentLabels>).filter(key => score.components[key] !== null && score.components[key]! < 35).map(key => componentLabels[key]);
  const watchItems = [...weak.map(label => `${label} أقل نسبيًا من بقية المحاور`), ...(score.evidenceScore ?? 0) < 40 ? ["قوة الأدلة محدودة"] : [], ...score.warnings.map(item => item === "inflation_not_period_aligned" ? "العائد الحقيقي غير محسوب لغياب تضخم مواءم زمنيًا" : item === "anomaly_candidate" ? "رصد قيمة غير اعتيادية تحتاج مراجعة" : item)];
  const profile = strengths.length >= 3 && (score.evidenceScore ?? 0) >= 60 ? "strong_multi_factor" : strengths.includes("الأداء") ? "performance_led" : strengths.includes("العائد المعدل بالمخاطر") ? "risk_quality_led" : "mixed_profile";
  return { profile, strengths, watchItems: Array.from(new Set(watchItems)), evidenceQuality: score.dataConfidence ?? "Insufficient" };
}

type VisualPoint = { date: string; value: number | null };

export function buildVisualizationReadiness(navPoints: VisualPoint[], performancePoints: VisualPoint[], scorePoints: VisualPoint[]) {
  const normalize = (points: VisualPoint[]) => Array.from(
    new Map(points.filter(point => point.value !== null && Number.isFinite(point.value)).map(point => [point.date, point])).values(),
  ).sort((left, right) => left.date.localeCompare(right.date));
  const nav = normalize(navPoints);
  const performance = normalize(performancePoints);
  const score = normalize(scorePoints);
  const series = (points: VisualPoint[], unavailableReason: string) => ({
    supported: points.length >= 2,
    pointCount: points.length,
    firstDate: points[0]?.date ?? null,
    lastDate: points.at(-1)?.date ?? null,
    reason: points.length >= 2 ? null : unavailableReason,
  });
  const performanceDates = new Set(performance.map(point => point.date));
  const scoreDates = new Set(score.map(point => point.date));
  const alignedDates = Array.from(performanceDates).filter(date => scoreDates.has(date)).sort();
  return {
    nav: series(nav, "لا توجد نقطتا NAV موثقتان على الأقل للرسم."),
    performance: series(performance, "لا توجد نقطتا عائد أسبوعي موثقتان على الأقل للرسم."),
    score: series(score, "لا توجد نقطتا SmartScore موثقتان على الأقل للرسم."),
    alignedPerformanceScore: {
      supported: alignedDates.length >= 2,
      pointCount: alignedDates.length,
      firstDate: alignedDates[0] ?? null,
      lastDate: alignedDates.at(-1) ?? null,
      reason: alignedDates.length >= 2 ? null : "لا يوجد تقاطع زمني موثق كافٍ بين الأداء وSmartScore.",
    },
  };
}

function assumedTbillWeeklyReturns(rows: IndicatorRow[]): WeeklyReturn[] {
  const yields = rows.filter(row => row.indicator_key === "TBILL_YIELD_AVG" && Number(row.value) > 0).sort((a, b) => a.report_date.localeCompare(b.report_date));
  return yields.slice(1).map((row, index) => {
    const elapsedDays = Math.max(1, Math.round((Date.parse(row.report_date) - Date.parse(yields[index].report_date)) / 86_400_000));
    return { date: row.report_date, returnPct: ((1 + Number(yields[index].value) / 100) ** (elapsedDays / 365) - 1) * 100, inputStatus: "assumed" as const };
  });
}

async function buildFundProfile(fundId: string) {
  const universe = await getFundUniverseSnapshot();
  const overview = universe.items.find(item => item.fundId === fundId);
  if (!overview) return null;
  const encoded = encodeURIComponent(fundId);
  const [performance, evaluations, prices, indicators, scoreDetail] = await Promise.all([
    supabaseRead<PerformanceRow[]>(`/rest/v1/fund_performance_history?select=fund_id,report_date,horizon,return_pct,currency,identity_status&fund_id=eq.${encoded}&identity_status=eq.EXACT_ACTIVE&order=report_date.asc&limit=500`),
    supabaseRead<EvaluationHistoryRow[]>(`/rest/v1/smartscore_evaluations?select=report_date,smartscore,performance_score,risk_score,benchmark_score,consistency_score,inflation_score,evidence_score,raw_rank,qualified_rank,qualification_status,data_confidence,data_tier,track_record,warnings&fund_id=eq.${encoded}&order=report_date.asc&limit=100`),
    supabaseRead<PriceRow[]>(`/rest/v1/fund_prices?select=fund_id,nav,currency,valuation_date,collected_at,status&fund_id=eq.${encoded}&status=eq.validated&valuation_date=lte.${cairoDate()}&order=valuation_date.asc,collected_at.asc&limit=500`),
    supabaseRead<IndicatorRow[]>("/rest/v1/eima_report_indicators?select=indicator_key,report_date,value&indicator_key=eq.TBILL_YIELD_AVG&order=report_date.asc&limit=100"),
    getSmartScoreDetail(fundId),
  ]);
  const latestPerformance = new Map<string, PerformanceRow>();
  for (const row of performance) latestPerformance.set(row.horizon, row);
  const weeklyReturns: WeeklyReturn[] = performance.filter(row => row.horizon === "weekly" && numeric(row.return_pct) !== null).map(row => ({ date: row.report_date, returnPct: numeric(row.return_pct)!, inputStatus: "verified" }));
  const riskInput: FundScoreInput = { fundId, category: overview.category ?? "Unclassified", reportDate: overview.reportDate ?? cairoDate(), horizonReturns: overview.returns, weeklyReturns, riskFreeWeeklyReturns: assumedTbillWeeklyReturns(indicators), benchmarks: [], inflationReturnPct: null, inflationStatus: "null", inputStatuses: ["verified"] };
  const riskMetrics = calculateRiskMetrics(riskInput);
  const performanceHistory = performance.filter(row => row.horizon === "weekly").map(row => ({ date: row.report_date, returnPct: numeric(row.return_pct) }));
  const navHistory = prices.map(row => ({ date: row.valuation_date, nav: numeric(row.nav), currency: row.currency }));
  const scoreHistory = evaluations.map(row => ({ date: row.report_date, smartScore: numeric(row.smartscore), evidenceScore: numeric(row.evidence_score), components: { P: numeric(row.performance_score), R: numeric(row.risk_score), B: numeric(row.benchmark_score), C: numeric(row.consistency_score), I: numeric(row.inflation_score) }, rawRank: row.raw_rank, qualifiedRank: row.qualified_rank, qualificationStatus: row.qualification_status, dataConfidence: row.data_confidence, dataTier: row.data_tier, trackRecord: row.track_record, warnings: row.warnings }));
  const visualization = buildVisualizationReadiness(
    navHistory.map(point => ({ date: point.date, value: point.nav })),
    performanceHistory.map(point => ({ date: point.date, value: point.returnPct })),
    scoreHistory.map(point => ({ date: point.date, value: point.smartScore })),
  );
  return {
    overview, executiveSignal: buildExecutiveSignal(overview), riskMetrics,
    fundSize: null as number | null, investmentStrategy: null as string | null,
    performanceIntelligence: Object.fromEntries(Array.from(latestPerformance.entries()).map(([horizon, row]) => [horizon, numeric(row.return_pct)])),
    performanceHistory, navHistory, scoreHistory, visualization,
    benchmarkResults: scoreDetail?.benchmarkResults ?? [], effectiveWeights: scoreDetail?.effectiveWeights ?? null, inputStatus: scoreDetail?.inputStatus ?? null,
  };
}

type FundProfile = Awaited<ReturnType<typeof buildFundProfile>>;
const profileCache = new Map<string, { expiresAt: number; data: FundProfile }>();

export async function getFundProfile(fundId: string): Promise<FundProfile> {
  const cached = profileCache.get(fundId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const data = await buildFundProfile(fundId);
  profileCache.set(fundId, { expiresAt: Date.now() + 5 * 60 * 1000, data });
  return data;
}
import { calculateRiskMetrics, type FundScoreInput, type WeeklyReturn } from "./smartScore";
import { getSmartScoreDetail } from "./smartScoreDashboard";
