import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, ChartNoAxesCombined, ShieldAlert } from "lucide-react";
import { useMemo } from "react";

type Point = { date: string; value: number | null };
type NavPoint = { date: string; nav: number | null; currency: string };
type ScorePoint = { date: string; smartScore: number | null; evidenceScore: number | null };
type SeriesReadiness = { supported: boolean; pointCount: number; firstDate: string | null; lastDate: string | null; reason: string | null };
type VisualizationReadiness = { nav: SeriesReadiness; performance: SeriesReadiness; score: SeriesReadiness; alignedPerformanceScore: SeriesReadiness };

const horizonLabels: Record<string, string> = { weekly: "1W", "4weeks": "4W", ytd: "YTD", last12m: "12M", "1y": "1Y", "2y": "2Y", "3y": "3Y", "4y": "4Y", "5y": "5Y", "6y": "6Y" };
const fmt = (value: number | null | undefined, digits = 1) => value === null || value === undefined ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits, useGrouping: false }).format(value);

function Unavailable({ text }: { text: string | null }) {
  return <div className="visual-unavailable"><ShieldAlert size={17} /><span>{text ?? "لا توجد بيانات مكتملة للرسم."}</span></div>;
}

export default function FundVisuals({
  navHistory, performanceHistory, scoreHistory, performanceIntelligence, components, visualization,
}: {
  navHistory: NavPoint[];
  performanceHistory: Array<{ date: string; returnPct: number | null }>;
  scoreHistory: ScorePoint[];
  performanceIntelligence: Record<string, number | null>;
  components: Record<"P" | "R" | "B" | "C" | "I", number | null>;
  visualization: VisualizationReadiness;
}) {
  const navIndex = useMemo(() => {
    const valid = navHistory.filter(point => point.nav !== null && point.nav > 0);
    const base = valid[0]?.nav ?? null;
    return base === null ? [] : valid.map(point => ({ date: point.date, index: (point.nav! / base) * 100 }));
  }, [navHistory]);
  const weekly = useMemo(() => performanceHistory.filter(point => point.returnPct !== null), [performanceHistory]);
  const scoreData = useMemo(() => scoreHistory.filter(point => point.smartScore !== null && point.evidenceScore !== null), [scoreHistory]);
  const horizonData = useMemo(() => Object.entries(performanceIntelligence).filter(([, value]) => value !== null).map(([horizon, value]) => ({ horizon: horizonLabels[horizon] ?? horizon, returnPct: value })), [performanceIntelligence]);
  const fingerprint = useMemo(() => (["P", "R", "B", "C", "I"] as const).filter(key => components[key] !== null).map(key => ({ axis: key, score: components[key] })), [components]);
  const readiness = [
    ["NAV", visualization.nav], ["العائد الأسبوعي", visualization.performance], ["SmartScore", visualization.score], ["الأداء × النتيجة", visualization.alignedPerformanceScore],
  ] as const;

  return <section className="visual-intelligence">
    <div className="visual-heading"><div><p className="eyebrow">VISUAL INTELLIGENCE</p><h2>الرؤية المرئية للأداء</h2></div><p>لا تُرسم إلا السلاسل ذات النقطتين الموثقتين على الأقل، ويُفصح عن نطاق كل سلسلة.</p></div>
    <div className="visual-readiness" aria-label="جاهزية الرسوم البيانية">
      {readiness.map(([label, item]) => <article key={label} className={item.supported ? "ready" : "not-ready"}><span>{label}</span><b>{item.supported ? `${item.pointCount} نقاط` : "غير متاح"}</b><small>{item.supported ? `${item.firstDate} ← ${item.lastDate}` : item.reason}</small></article>)}
    </div>
    <div className="visual-grid">
      <article className="visual-card"><header><div><ChartNoAxesCombined size={17}/><p className="eyebrow">NAV TRAJECTORY</p><h3>مسار NAV الموحّد</h3></div><span>البداية = 100</span></header>{visualization.nav.supported ? <ResponsiveContainer width="100%" height={245}><AreaChart data={navIndex}><defs><linearGradient id="navGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#19c39a" stopOpacity={.35}/><stop offset="100%" stopColor="#19c39a" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1b454d" vertical={false}/><XAxis dataKey="date" stroke="#648f89" fontSize={9}/><YAxis stroke="#648f89" fontSize={9} domain={["auto", "auto"]}/><Tooltip contentStyle={{ background:"#071e23", border:"1px solid #35606a", fontSize:10 }}/><Area type="monotone" dataKey="index" stroke="#19c39a" fill="url(#navGradient)" strokeWidth={2}/></AreaChart></ResponsiveContainer> : <Unavailable text={visualization.nav.reason}/>}</article>
      <article className="visual-card"><header><div><BarChart3 size={17}/><p className="eyebrow">WEEKLY PERFORMANCE</p><h3>العائد الأسبوعي المنشور</h3></div><span>{visualization.performance.pointCount} نقاط</span></header>{visualization.performance.supported ? <ResponsiveContainer width="100%" height={245}><BarChart data={weekly}><CartesianGrid stroke="#1b454d" vertical={false}/><XAxis dataKey="date" stroke="#648f89" fontSize={9}/><YAxis stroke="#648f89" fontSize={9}/><Tooltip contentStyle={{ background:"#071e23", border:"1px solid #35606a", fontSize:10 }}/><Bar dataKey="returnPct" fill="#d99a5f" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer> : <Unavailable text={visualization.performance.reason}/>}</article>
      <article className="visual-card"><header><div><ChartNoAxesCombined size={17}/><p className="eyebrow">SCORE &amp; EVIDENCE</p><h3>تطور النتيجة والأدلة</h3></div><span>{visualization.alignedPerformanceScore.pointCount} تواريخ مواءمة</span></header>{visualization.score.supported ? <ResponsiveContainer width="100%" height={245}><LineChart data={scoreData}><CartesianGrid stroke="#1b454d" vertical={false}/><XAxis dataKey="date" stroke="#648f89" fontSize={9}/><YAxis domain={[0,100]} stroke="#648f89" fontSize={9}/><Tooltip contentStyle={{ background:"#071e23", border:"1px solid #35606a", fontSize:10 }}/><Legend wrapperStyle={{fontSize:10}}/><Line type="monotone" dataKey="smartScore" name="SmartScore" stroke="#19c39a" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="evidenceScore" name="Evidence" stroke="#d99a5f" strokeWidth={1.5} dot={false}/></LineChart></ResponsiveContainer> : <Unavailable text={visualization.score.reason}/>}</article>
      <article className="visual-card"><header><div><BarChart3 size={17}/><p className="eyebrow">HORIZON MATRIX</p><h3>مصفوفة الأداء الرسمي</h3></div><span>بدون ملء تقديري</span></header>{horizonData.length ? <ResponsiveContainer width="100%" height={245}><BarChart data={horizonData} layout="vertical" margin={{left:10,right:10}}><CartesianGrid stroke="#1b454d" horizontal={false}/><XAxis type="number" stroke="#648f89" fontSize={9}/><YAxis dataKey="horizon" type="category" stroke="#648f89" fontSize={9} width={32}/><Tooltip contentStyle={{ background:"#071e23", border:"1px solid #35606a", fontSize:10, direction:"rtl" }}/><Bar dataKey="returnPct" fill="#a894ff" radius={[0,2,2,0]}/></BarChart></ResponsiveContainer> : <Unavailable text="لا يوجد أفق أداء رسمي متاح لهذا الصندوق." />}</article>
      <article className="visual-card visual-card-wide"><header><div><ChartNoAxesCombined size={17}/><p className="eyebrow">SCORE FINGERPRINT</p><h3>بصمة التصنيف</h3></div><span>P30 · R25 · B25 · C10 · I10</span></header>{fingerprint.length >= 3 ? <ResponsiveContainer width="100%" height={275}><RadarChart data={fingerprint}><PolarGrid stroke="#315b63"/><PolarAngleAxis dataKey="axis" stroke="#afc8c2" fontSize={11}/><Radar dataKey="score" name="Component" stroke="#19c39a" fill="#19c39a" fillOpacity={.28}/><Tooltip contentStyle={{ background:"#071e23", border:"1px solid #35606a", fontSize:10 }}/></RadarChart></ResponsiveContainer> : <Unavailable text="لا توجد ثلاثة محاور SmartScore موثقة على الأقل للرسم." />}</article>
    </div>
  </section>;
}
