import ProductShell from "@/components/ProductShell";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, BarChart3, Search, ShieldCheck, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const metrics = [{ id:"smart", label:"SmartScore", key:"smartScore" }, { id:"performance", label:"الأداء P", key:"P" }, { id:"risk", label:"المخاطر R", key:"R" }, { id:"benchmark", label:"المراجع B", key:"B" }, { id:"consistency", label:"الاتساق C", key:"C" }, { id:"real", label:"العائد الحقيقي I", key:"I" }, { id:"confidence", label:"قوة الأدلة", key:"evidenceScore" }] as const;
const palette = ["#19c39a", "#d99a5f", "#a894ff", "#e7bd64", "#ff7b72", "#76bde9", "#7fc499", "#e6a8c7"];
const fmt = (value: number | null | undefined, digits=1) => value === null || value === undefined ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits:digits, minimumFractionDigits:digits, useGrouping:false }).format(value);
type VisualItem = { fundId:string; canonicalName:string; category:string|null; smartScore:number|null; components:Record<"P"|"R"|"B"|"C"|"I",number|null>; evidenceScore:number|null; dataConfidence:string|null; qualificationStatus:string|null; };
type RankRow = { item:VisualItem; value:number };

function RankingVisuals({ rows, items, metricLabel }: { rows:RankRow[]; items:VisualItem[]; metricLabel:string }) {
  const distribution = useMemo(() => [0,20,40,60,80].map(start => ({ band:`${start}–${start + 19}`, count:rows.filter(row => row.value >= start && row.value < start + 20).length })), [rows]);
  const positioning = useMemo(() => items.filter(item => item.components.P !== null && item.components.R !== null).map(item => ({ x:item.components.P!, y:item.components.R!, z:Math.max(item.evidenceScore ?? 0, 1), name:item.canonicalName, category:item.category ?? "غير مصنف" })), [items]);
  const categoryAverages = useMemo(() => {
    const buckets = new Map<string, number[]>();
    rows.forEach(row => { const name = row.item.category ?? "غير مصنف"; buckets.set(name, [...(buckets.get(name) ?? []), row.value]); });
    return Array.from(buckets, ([category, values]) => ({ category, average:values.reduce((total, value) => total + value, 0) / values.length, observations:values.length })).sort((a,b) => b.average - a.average).slice(0, 8);
  }, [rows]);
  return <section className="ranking-visuals">
    <div className="ranking-visual-heading"><div><p className="eyebrow">RANKING VISUAL INTELLIGENCE</p><h2>قراءة مرئية للتصنيف</h2></div><p>كل نقطة أو متوسط يستخدم قيماً متاحة فقط؛ عدد المدخلات المعروضة يمنع مساواة الفئات ذات الأدلة غير المتكافئة.</p></div>
    <div className="ranking-visual-grid">
      <article className="ranking-visual-card"><header><div><BarChart3 size={17}/><p className="eyebrow">SCORE DISTRIBUTION</p><h3>توزيع {metricLabel}</h3></div><span>{rows.length} قيمة</span></header><ResponsiveContainer width="100%" height={260}><BarChart data={distribution}><CartesianGrid stroke="#1b454d" vertical={false}/><XAxis dataKey="band" stroke="#648f89" fontSize={9}/><YAxis allowDecimals={false} stroke="#648f89" fontSize={9}/><Tooltip contentStyle={{background:"#071e23",border:"1px solid #35606a",fontSize:10}}/><Bar dataKey="count" name="عدد الصناديق" radius={[2,2,0,0]}>{distribution.map((item,index) => <Cell key={item.band} fill={palette[index]}/>)}</Bar></BarChart></ResponsiveContainer></article>
      <article className="ranking-visual-card"><header><div><Target size={17}/><p className="eyebrow">PERFORMANCE × RISK</p><h3>تموضع الجودة</h3></div><span>{positioning.length} نقطة</span></header><ResponsiveContainer width="100%" height={260}><ScatterChart margin={{top:10,right:10,bottom:10,left:0}}><CartesianGrid stroke="#1b454d"/><XAxis type="number" dataKey="x" name="الأداء P" domain={[0,100]} stroke="#648f89" fontSize={9}/><YAxis type="number" dataKey="y" name="المخاطر R" domain={[0,100]} stroke="#648f89" fontSize={9}/><ZAxis type="number" dataKey="z" range={[40,190]} name="قوة الأدلة"/><Tooltip cursor={{strokeDasharray:"3 3"}} contentStyle={{background:"#071e23",border:"1px solid #35606a",fontSize:10}} formatter={(value:number, name:string) => [fmt(value), name]}/><Scatter name="الصناديق" data={positioning} fill="#19c39a" fillOpacity={.75}/></ScatterChart></ResponsiveContainer><footer>المحوران يمثلان درجتي P وR من SmartScore، لا عائدًا نقديًا أو تقلبًا خامًا.</footer></article>
      <article className="ranking-visual-card ranking-visual-wide"><header><div><BarChart3 size={17}/><p className="eyebrow">CATEGORY CONTEXT</p><h3>متوسط الفئات: {metricLabel}</h3></div><span>معروض مع حجم العينة</span></header>{categoryAverages.length ? <ResponsiveContainer width="100%" height={290}><BarChart data={categoryAverages} layout="vertical" margin={{left:30,right:35}}><CartesianGrid stroke="#1b454d" horizontal={false}/><XAxis type="number" domain={[0,100]} stroke="#648f89" fontSize={9}/><YAxis type="category" dataKey="category" width={155} stroke="#a9c4bf" fontSize={9}/><Tooltip contentStyle={{background:"#071e23",border:"1px solid #35606a",fontSize:10}} formatter={(value:number, name:string) => [name === "average" ? fmt(value) : value, name === "average" ? metricLabel : "عدد المدخلات"]}/><Bar dataKey="average" name="average" fill="#a894ff" radius={[0,2,2,0]}/></BarChart></ResponsiveContainer> : <div className="visual-unavailable">لا توجد قيم كافية لتجميع الفئات لهذا المحور.</div>}<footer>متوسط الفئة يحسب من الصناديق التي تملك قيمة للمحور المختار فقط.</footer></article>
    </div>
  </section>;
}

export default function Rankings() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = trpc.platform.universe.useQuery(undefined, { retry:false, refetchOnWindowFocus:false });
  const [metric, setMetric] = useState<(typeof metrics)[number]["id"]>("smart");
  const [category, setCategory] = useState("__all__");
  const [search, setSearch] = useState("");
  const definition = metrics.find(item => item.id === metric)!;
  const filteredItems = useMemo(() => (data?.items ?? []).filter(item => (category === "__all__" || item.category === category) && item.canonicalName.toLowerCase().includes(search.toLowerCase())), [data, category, search]);
  const rows = useMemo(() => filteredItems.map(item => ({ item, value:definition.key in item.components ? item.components[definition.key as "P"|"R"|"B"|"C"|"I"] : definition.key === "smartScore" ? item.smartScore : item.evidenceScore })).filter((row): row is { item:typeof filteredItems[number]; value:number } => row.value !== null).sort((a,b) => b.value - a.value), [filteredItems, definition]);
  return <ProductShell title="تصنيفات الصناديق" eyebrow="RANKINGS · ONE LENS AT A TIME" description="سبعة عدسات منفصلة. اختر محورًا واحدًا — الأداء أو المخاطر أو المراجع أو الأدلة — دون دمجها في ترتيب واحد مضلل.">
    <section className="rank-lens-banner" aria-label="العدسة النشطة">
      <div>
        <p className="eyebrow">ACTIVE LENS</p>
        <h2>{definition.label}</h2>
        <p>يُرتَّب فقط من يملك قيمة حقيقية على هذا المحور. المفقود يبقى مفقودًا ولا يُستبدل بصفر.</p>
      </div>
      <div className="rank-lens-count">
        <span>نتائج قابلة للترتيب</span>
        <strong className="mono">{isLoading ? "…" : fmt(rows.length, 0)}</strong>
      </div>
    </section>
    <div className="rank-tabs" role="tablist" aria-label="محاور التصنيف">{metrics.map(item => <button key={item.id} role="tab" aria-selected={metric === item.id} onClick={() => setMetric(item.id)} className={metric === item.id ? "active" : ""}>{item.label}</button>)}</div>
    <section className="rank-controls">
      <label><Search size={14}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث باسم الصندوق" aria-label="بحث في التصنيفات"/></label>
      <select value={category} onChange={event => setCategory(event.target.value)} aria-label="تصفية الفئة"><option value="__all__">كل الفئات</option>{data?.facets.categories.map(item => <option key={item} value={item}>{item}</option>)}</select>
    </section>
    {!isLoading && !error && <RankingVisuals rows={rows} items={filteredItems} metricLabel={definition.label}/>}
    {error ? <div className="platform-empty">تعذر تحميل التصنيفات. لا تُعرض نتائج بديلة.</div> : <section className="rank-board" aria-label="لوحة الترتيب">
      <header className="rank-board-head"><span>#</span><span>الصندوق</span><span>{definition.label}</span><span>Evidence</span><span>الأهلية</span><span className="sr-only">فتح</span></header>
      <div className="rank-board-list">{rows.slice(0,100).map((row,index) => <article key={row.item.fundId} onClick={() => setLocation(`/funds/${encodeURIComponent(row.item.fundId)}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setLocation(`/funds/${encodeURIComponent(row.item.fundId)}`); } }} role="link" tabIndex={0}>
        <strong className="mono rank-index">{index + 1}</strong>
        <div className="rank-fund-meta"><b>{row.item.canonicalName}</b><small>{row.item.category ?? "غير مصنف"}</small></div>
        <span className="mono rank-value">{fmt(row.value)}</span>
        <span className={`status-chip ${(row.item.dataConfidence ?? "insufficient").toLowerCase()}`}>{fmt(row.item.evidenceScore,0)} · {row.item.dataConfidence ?? "—"}</span>
        <span>{row.item.qualificationStatus === "qualified" ? <span className="status-chip verified"><ShieldCheck size={12}/>مؤهل</span> : <span className="status-chip pending">Raw Rank</span>}</span>
        <ArrowUpLeft size={15} aria-hidden="true"/>
      </article>)}</div>
    </section>}
    {isLoading && <div className="platform-empty"><BarChart3 size={20}/>يجري بناء التصنيف من أحدث تقرير…</div>}
    {!isLoading && !rows.length && !error && <div className="platform-empty">لا تتوفر قيم قابلة للترتيب لهذا المحور والفئة حاليًا؛ لا يُستخدم الصفر بدل البيانات المفقودة.</div>}
    <p className="public-disclosure">كل ترتيب يعرض فقط الصناديق التي يتوفر لها المحور المحدد. Qualified Rank منفصل عن Raw Rank ولا يُمنح دون شروط الأدلة.</p>
  </ProductShell>;
}
