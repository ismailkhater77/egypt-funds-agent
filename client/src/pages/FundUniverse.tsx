import ProductShell from "@/components/ProductShell";
import { trpc } from "@/lib/trpc";
import { buildFundUniverseCsv, filterUniverseItems, type MarketCriterion, type TrackRecordPeriod, type UniverseFilters } from "@/lib/universeFilters";
import { ArrowUpLeft, Database, Download, Filter, RefreshCcw, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const fmt = (value: number | null | undefined, digits = 1) => value === null || value === undefined ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits, useGrouping: false }).format(value);
const ALL = "__all__";

const periods: Array<{ value: TrackRecordPeriod; label: string }> = [
  { value: "all", label: "كل الآفاق" }, { value: "last12m", label: "12 شهرًا" }, { value: "1y", label: "سنة واحدة" }, { value: "2y", label: "سنتان" }, { value: "3y", label: "3 سنوات" }, { value: "4y", label: "4 سنوات" }, { value: "5y", label: "5 سنوات" }, { value: "6y", label: "6 سنوات" },
];

const criterionChips: Array<{ id: MarketCriterion | "inflation" | "bitcoin_egp" | "msci_em_egp" | "sp500_egp" | "silver_egp"; label: string; available: boolean; note: string }> = [
  { id: "best_category", label: "الأفضل ضمن الفئة", available: true, note: "أعلى SmartScore متاح داخل الفئة" },
  { id: "inflation", label: "التضخم", available: false, note: "لا تتوفر سلسلة تضخم مواءمة زمنيًا" },
  { id: "tbills", label: "أذون الخزانة", available: true, note: "مرجع طبيعي محفوظ للصندوق" },
  { id: "bitcoin_egp", label: "Bitcoin/EGP", available: false, note: "لا توجد فترة متوافقة مع تاريخ الصناديق" },
  { id: "msci_em_egp", label: "MSCI EM/EGP", available: false, note: "التاريخ المتاح لقطة جزئية فقط" },
  { id: "sp500_egp", label: "S&P 500/EGP", available: false, note: "لا توجد فترة متوافقة مع تاريخ الصناديق" },
  { id: "usd_egp", label: "USD/EGP", available: true, note: "مرجع طبيعي محفوظ للصندوق" },
  { id: "silver_egp", label: "Silver/EGP", available: false, note: "لا توجد فترة متوافقة مع تاريخ الصناديق" },
  { id: "gold_egp", label: "Gold/EGP", available: true, note: "مرجع طبيعي محفوظ للصندوق" },
  { id: "egx30", label: "EGX 30", available: true, note: "مرجع طبيعي محفوظ للصندوق" },
];

export default function FundUniverse() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = trpc.platform.universe.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [manager, setManager] = useState(ALL);
  const [fundType, setFundType] = useState(ALL);
  const [currency, setCurrency] = useState(ALL);
  const [activeStatus, setActiveStatus] = useState<UniverseFilters["activeStatus"]>("all");
  const [availability, setAvailability] = useState(ALL);
  const [period, setPeriod] = useState<TrackRecordPeriod>("all");
  const [criterion, setCriterion] = useState<MarketCriterion | null>(null);
  const [sort, setSort] = useState("score");
  const filters = useMemo<UniverseFilters>(() => ({ search, category, manager, fundType, currency, activeStatus, availability, period, criterion }), [search, category, manager, fundType, currency, activeStatus, availability, period, criterion]);
  const items = useMemo(() => {
    const filtered = filterUniverseItems(data?.items ?? [], filters);
    return [...filtered].sort((a, b) => sort === "ytd" ? (b.returns.ytd ?? -Infinity) - (a.returns.ytd ?? -Infinity) : sort === "evidence" ? (b.evidenceScore ?? -1) - (a.evidenceScore ?? -1) : sort === "name" ? a.canonicalName.localeCompare(b.canonicalName) : (b.smartScore ?? -1) - (a.smartScore ?? -1));
  }, [data, filters, sort]);
  const selectedFilters = [search, category, manager, fundType, currency, activeStatus === "all" ? "" : activeStatus, availability, period === "all" ? "" : period, criterion ?? ""].filter(Boolean).length;
  const clear = () => { setSearch(""); setCategory(ALL); setManager(ALL); setFundType(ALL); setCurrency(ALL); setActiveStatus("all"); setAvailability(ALL); setPeriod("all"); setCriterion(null); };
  const exportCsv = () => {
    const href = URL.createObjectURL(new Blob([buildFundUniverseCsv(items)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = href; anchor.download = `nile-fund-universe-${data?.asOfDate ?? "export"}.csv`; anchor.click(); URL.revokeObjectURL(href);
  };

  return <ProductShell title="دليل الصناديق" eyebrow="FUND UNIVERSE / VERIFIED CATALOG" description="كل نتيجة تُعرض عند تحقق جميع الشروط المحددة؛ لا تستخدم المنصة مؤشرات بديلة أو نتائج تقديرية.">
    <section className="platform-kpis">{[{ label: "إجمالي الدليل", value: data?.summary.total, note: "سجلات قاعدة البيانات" }, { label: "صندوق نشط", value: data?.summary.active, note: "حالة الكتالوج" }, { label: "NAV حالي موثق", value: data?.summary.withCurrentNav, note: "حتى تاريخ القاهرة" }, { label: "SmartScore متاح", value: data?.summary.scored, note: data?.reportDate ?? "—" }].map(item => <article key={item.label}><span>{item.label}</span><strong>{isLoading ? "…" : fmt(item.value, 0)}</strong><small>{item.note}</small></article>)}</section>
    <section className="advanced-filter-surface" aria-label="الفلاتر المتقدمة"><p className="filter-logic"><b>فلسفة التصفية:</b> تُطبَّق الشروط المحددة بمنطق <span>AND</span>؛ تظهر النتائج وفق جميع المعايير معًا، والترتيب الافتراضي هو الأعلى درجة.</p><div className="filter-command-row"><div className="filter-search"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث: اسم الصندوق أو المدير…" aria-label="البحث باسم الصندوق أو المدير" /></div><FilterSelect label="الفئة" compact value={category} onChange={setCategory} values={data?.facets.categories ?? []} /><FilterSelect label="المدة" compact value={period} onChange={value => setPeriod(value as TrackRecordPeriod)} values={periods.map(item => item.value)} labels={Object.fromEntries(periods.map(item => [item.value, item.label]))} includeAll={false} /><button type="button" className="filter-action" onClick={clear}><RefreshCcw size={14} />إعادة ضبط</button><button type="button" className="filter-action export" onClick={exportCsv} disabled={!items.length}><Download size={14} />تصدير CSV</button></div><div className="criterion-row" aria-label="معايير السوق"><span>معيار سوقي:</span>{criterionChips.map(chip => <button type="button" key={chip.id} title={chip.note} disabled={!chip.available} className={`criterion-chip ${criterion === chip.id ? "active" : ""} ${chip.available ? "" : "unavailable"}`} onClick={() => chip.available && setCriterion(current => current === chip.id ? null : chip.id as MarketCriterion)}>{chip.label}{!chip.available && <small>غير متاح</small>}</button>)}</div></section>
    <section className="universe-layout"><aside className="filter-panel"><div className="filter-title"><Filter size={15} /><b>خصائص الصندوق</b><span>{selectedFilters ? `${selectedFilters} شروط` : "بدون شروط إضافية"}</span></div><FilterSelect label="شركة الإدارة" value={manager} onChange={setManager} values={data?.facets.managers ?? []} /><FilterSelect label="نوع الصندوق" value={fundType} onChange={setFundType} values={data?.facets.fundTypes ?? []} /><FilterSelect label="العملة" value={currency} onChange={setCurrency} values={data?.facets.currencies ?? []} /><FilterSelect label="الحالة" value={activeStatus} onChange={value => setActiveStatus(value as UniverseFilters["activeStatus"])} values={["active", "inactive"]} labels={{ active: "نشط", inactive: "غير نشط" }} /><FilterSelect label="توافر البيانات" value={availability} onChange={setAvailability} values={data?.facets.dataAvailability ?? []} labels={{ complete: "مكتملة", partial: "جزئية", limited: "محدودة" }} /></aside><div className="universe-results"><div className="result-toolbar"><div><p className="eyebrow">FILTERED CATALOG / AND LOGIC</p><b>{fmt(items.length, 0)} نتيجة مطابقة</b></div><select value={sort} onChange={event => setSort(event.target.value)} aria-label="ترتيب النتائج"><option value="score">SmartScore: الأعلى أولًا</option><option value="ytd">أداء YTD: الأعلى أولًا</option><option value="evidence">قوة الأدلة: الأعلى أولًا</option><option value="name">الاسم: أبجديًا</option></select></div>{error ? <div className="platform-empty">تعذر تحميل دليل الصناديق. لا تُعرض بيانات بديلة.</div> : <div className="universe-grid">{items.map(item => <article className="fund-universe-card" key={item.fundId} onClick={() => setLocation(`/funds/${encodeURIComponent(item.fundId)}`)}><div className="fund-card-head"><span className={`availability-dot ${item.dataAvailability}`} /><span>{item.fundType}</span><ArrowUpLeft size={15} /></div><h2>{item.canonicalName}</h2><p>{item.manager ?? "شركة الإدارة غير متاحة"}</p><div className="fund-stat-grid"><span><small>SmartScore</small><b className="mono">{fmt(item.smartScore)}</b></span><span><small>YTD</small><b className="mono">{item.returns.ytd === null ? "—" : `${fmt(item.returns.ytd)}%`}</b></span><span><small>Evidence</small><b className="mono">{fmt(item.evidenceScore, 0)}</b></span></div><footer><span>{item.currency ?? "—"}</span><span>{item.trackRecord ?? "غير مقيم"}</span>{item.verifiedSnapshot ? <span className="verified-label"><ShieldCheck size={12} />NAV موثق</span> : <span><Database size={12} />NAV غير متاح</span>}</footer></article>)}</div>}{!isLoading && !items.length && !error && <div className="platform-empty"><Sparkles size={20} />لا توجد نتائج تحقق جميع الشروط المحددة. أزل شرطًا أو أعد ضبط الفلاتر.</div>}</div></section><p className="public-disclosure">التصنيف هنا بحثي وتاريخي فقط. التصدير يعكس النتائج المصفاة الحالية، ولا يمثل وجود الصندوق أو ترتيبه توصية استثمارية شخصية.</p>
  </ProductShell>;
}

function FilterSelect({ label, value, onChange, values, labels, includeAll = true, compact = false }: { label: string; value: string; onChange: (value: string) => void; values: readonly string[]; labels?: Record<string, string>; includeAll?: boolean; compact?: boolean }) {
  return <label className={compact ? "compact-filter" : undefined}><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}><option value={ALL}>{includeAll ? "الكل" : ""}</option>{values.map(item => <option value={item} key={item}>{labels?.[item] ?? item}</option>)}</select></label>;
}
