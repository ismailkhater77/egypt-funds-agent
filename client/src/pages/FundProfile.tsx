import ProductShell from "@/components/ProductShell";
import FundVisuals from "@/components/FundVisuals";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BadgeCheck, CircleGauge, FileWarning, Landmark, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

const componentMeta = { P: ["الأداء", "PERFORMANCE", "#19c39a"], R: ["المخاطر", "RISK ADJUSTED", "#d99a5f"], B: ["المراجع", "BENCHMARK HIT", "#a894ff"], C: ["الاتساق", "CONSISTENCY", "#e7bd64"], I: ["العائد الحقيقي", "REAL RETURN", "#ff7b72"] } as const;
const horizonLabels: Record<string, string> = { weekly:"1W", "4weeks":"4W", ytd:"YTD", last12m:"12M", "1y":"1Y", "2y":"2Y", "3y":"3Y", "4y":"4Y", "5y":"5Y", "6y":"6Y" };
const profileLabels: Record<string, string> = { strong_multi_factor:"قوة متعددة المحاور", performance_led:"ملف تقوده قوة الأداء", risk_quality_led:"ملف تقوده جودة المخاطر", mixed_profile:"ملف متوازن بإشارات مختلطة", insufficient_evidence:"أدلة غير كافية للحكم" };
const benchmarkLabels: Record<string,string> = { EGX30:"EGX30", TBILLS:"T-Bill", USD:"USD", GOLD:"Gold", SILVER:"Silver", SP500:"S&P 500", MSCI_EM:"MSCI EM", BITCOIN:"Bitcoin", INFLATION:"Inflation" };
const fmt = (value: number | null | undefined, digits=1) => value === null || value === undefined ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits:digits, minimumFractionDigits:digits, useGrouping:false }).format(value);

export default function FundProfile({ params }: { params: { fundId: string } }) {
  const [, setLocation] = useLocation();
  const fundId = decodeURIComponent(params.fundId);
  const input = useMemo(() => ({ fundId }), [fundId]);
  const { data, isLoading, error } = trpc.platform.profile.useQuery(input, { retry:false, refetchOnWindowFocus:false });
  if (isLoading) return <ProductShell title="ملف الصندوق" eyebrow="FUND DNA · PROFILE / LOADING"><div className="platform-empty">يجري تجميع ملف الصندوق والأدلة…</div></ProductShell>;
  if (error || !data) return <ProductShell title="ملف الصندوق" eyebrow="FUND DNA · PROFILE / UNAVAILABLE"><div className="platform-empty">تعذر العثور على ملف موثق لهذا الصندوق.</div></ProductShell>;
  const { overview } = data;
  const overviewCards = [
    ["أحدث NAV", overview.latestNav === null ? "—" : fmt(overview.latestNav, 4), overview.valuationDate ?? "غير متاح"],
    ["شركة الإدارة", overview.manager ?? "غير متاح", "الاسم المحفوظ"],
    ["الفئة", overview.category ?? "غير متاح", "Peer Cohort"],
    ["حجم الصندوق", "غير متاح", "لا يوجد حقل موثق"],
    ["استراتيجية الاستثمار", "غير متاحة", "تنتظر مصدرًا موثقًا"],
    ["Track Record", overview.trackRecord ?? "غير مقيم", overview.reportDate ?? "—"],
  ];
  return <ProductShell title={overview.canonicalName} eyebrow="FUND DNA · PROFILE / FUND DNA" description={`${overview.manager ?? "شركة الإدارة غير متاحة"} · ${overview.category ?? "الفئة غير متاحة"}`}>
    <button className="profile-back" onClick={() => setLocation("/funds")}><ArrowRight size={14}/>العودة إلى دليل الصناديق</button>
    <section className="profile-hero">
      <div className="profile-identity">
        <div className="profile-badges"><span>{overview.fundType}</span><span>{overview.currency ?? "العملة غير متاحة"}</span>{overview.verifiedSnapshot && <span className="verified"><ShieldCheck size={12}/>NAV موثق</span>}</div>
        <h2>{overview.canonicalName}</h2><p>{profileLabels[data.executiveSignal.profile] ?? data.executiveSignal.profile}</p>
        <div className="profile-verdict"><small>EXECUTIVE VERDICT</small><strong>{data.executiveSignal.strengths.length ? `تبرز قوة ${data.executiveSignal.strengths.join(" و")}` : "لا توجد قوة مثبتة كافية لإصدار إشارة موجزة"}</strong><span>حكم بحثي وصفي، وليس توصية استثمارية شخصية.</span></div>
      </div>
      <div className="profile-score"><div className="score-orbit" style={{ "--score": overview.smartScore ?? 0 } as React.CSSProperties}><span>SmartScore</span><strong className="mono">{fmt(overview.smartScore)}</strong><small>من 100</small></div><div><span>Evidence <b className="mono">{fmt(overview.evidenceScore, 0)}</b></span><span>{overview.dataConfidence ?? "Insufficient"}</span><span>{overview.dataTier ?? "Unverified"}</span></div></div>
    </section>
    <section className="profile-overview-grid">{overviewCards.map(([label, value, note]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>{note}</span></article>)}</section>
    <SectionTitle icon={CircleGauge} eyebrow="DNA FINGERPRINT" title="البصمة التحليلية" note="الأوزان المعتمدة: P30 / R25 / B25 / C10 / I10"/>
    <section className="dna-grid">{(Object.keys(componentMeta) as Array<keyof typeof componentMeta>).map(key => { const value = overview.components[key]; const [label, english, color] = componentMeta[key]; const weight = data.effectiveWeights?.[key] ?? null; return <article key={key} style={{ "--dna-color": color } as React.CSSProperties}><header><span>{key}</span><small>{english}</small></header><h3>{label}</h3><strong className="mono">{fmt(value)}</strong><div><i style={{ width:`${value ?? 0}%` }}/></div><footer>الوزن الفعلي <b className="mono">{weight === null ? "—" : `${fmt(weight)}%`}</b></footer></article>; })}</section>
    <SectionTitle icon={BadgeCheck} eyebrow="PERFORMANCE INTELLIGENCE" title="ذكاء الأداء" note="الفترات الرسمية المنشورة في أحدث تقرير"/>
    <section className="performance-strip">{Object.entries(horizonLabels).map(([key, label]) => { const value = data.performanceIntelligence[key]; return <article key={key}><small>{label}</small><strong className="mono">{value === null || value === undefined ? "—" : `${fmt(value)}%`}</strong><span>{value === null || value === undefined ? "غير متاح" : "عائد منشور"}</span></article>; })}</section>
    <FundVisuals navHistory={data.navHistory} performanceHistory={data.performanceHistory} scoreHistory={data.scoreHistory} performanceIntelligence={data.performanceIntelligence} components={overview.components} visualization={data.visualization}/>
    <SectionTitle icon={Landmark} eyebrow="BENCHMARK CONSTELLATION" title="كوكبة المراجع" note="كل مرجع يحتفظ بحالة المدخل والمواءمة بشكل مستقل"/>
    <section className="constellation-grid">{data.benchmarkResults.map(item => <article key={item.benchmarkKey} className={item.status}><header><span>{benchmarkLabels[item.benchmarkKey] ?? item.benchmarkKey}</span><small>{item.benchmarkRole}</small></header><strong className="mono">{item.returnPct === null ? "—" : `${fmt(item.returnPct)}%`}</strong><p>التفوق <b className="mono">{item.outperformancePct === null ? "—" : `${fmt(item.outperformancePct)}%`}</b></p><footer><span>{item.inputStatus}</span><span>{item.status}</span></footer></article>)}</section>
    <section className="risk-reliability-grid">
      <article className="profile-panel"><header><div><p className="eyebrow">RISK PROFILE</p><h3>مقاييس المخاطر</h3></div><span>نفس منهجية SmartScore</span></header><div className="risk-metric-grid">{[["Volatility", data.riskMetrics.volatility, "%"], ["Sharpe", data.riskMetrics.sharpe, ""], ["Sortino", data.riskMetrics.sortino, ""], ["Max Drawdown", data.riskMetrics.maxDrawdown, "%"]].map(([label, value, suffix]) => <article key={String(label)}><small>{label}</small><strong className="mono">{value === null ? "—" : `${fmt(Number(value), 2)}${suffix}`}</strong></article>)}</div><p className="panel-note">Sharpe وSortino يستخدمان عائد أذون الخزانة الأسبوعي المعلن كمدخل assumed؛ النقص يظل null.</p></article>
      <article className="reliability-panel"><div><BadgeCheck size={20}/><p className="eyebrow">RELIABILITY</p><h3>مصفوفة الموثوقية</h3></div><div className="reliability-stats"><span><small>Confidence</small><b>{overview.dataConfidence ?? "Insufficient"}</b></span><span><small>Data Tier</small><b>{overview.dataTier ?? "Unverified"}</b></span><span><small>Completeness</small><b>{overview.dataAvailability}</b></span><span><small>Track Record</small><b>{overview.trackRecord ?? "غير متاح"}</b></span><span><small>Raw Rank</small><b className="mono">{overview.rawRank ?? "—"}</b></span><span><small>Qualified Rank</small><b className="mono">{overview.qualifiedRank ?? "—"}</b></span></div><div className="quality-flags"><FileWarning size={16}/><div>{data.executiveSignal.watchItems.length ? data.executiveSignal.watchItems.map(item => <span key={item}>{item}</span>) : <span>لا توجد أعلام جودة إضافية في أحدث تقييم.</span>}</div></div></article>
    </section>
    <p className="public-disclosure">جميع النتائج مرتبطة بإصدار SmartScore v1.0 وتاريخ التقرير. البيانات المفقودة لا تُحوّل إلى صفر، والصفحة لا تعرض روابط المصادر أو تفاصيل التشغيل.</p>
  </ProductShell>;
}

function SectionTitle({ icon: Icon, eyebrow, title, note }: { icon: typeof BadgeCheck; eyebrow: string; title: string; note: string }) {
  return <div className="profile-section-title"><Icon size={18}/><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><span>{note}</span></div>;
}
