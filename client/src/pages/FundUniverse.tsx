import ProductShell from "@/components/ProductShell";
import { trpc } from "@/lib/trpc";
import { buildFundUniverseCsv, filterUniverseItems, type MarketCriterion, type TrackRecordPeriod, type UniverseFilters } from "@/lib/universeFilters";
import { ArrowUpLeft, ChevronDown, CircleAlert, Database, Download, Filter, RefreshCcw, Search, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const fmt = (value: number | null | undefined, digits = 1) => value === null || value === undefined ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits, useGrouping: false }).format(value);
const ALL = "__all__";

const periods: Array<{ value: TrackRecordPeriod; label: string }> = [
  { value: "all", label: "كل الآفاق" }, { value: "last12m", label: "12 شهرًا" }, { value: "1y", label: "سنة واحدة" }, { value: "2y", label: "سنتان" }, { value: "3y", label: "3 سنوات" }, { value: "4y", label: "4 سنوات" }, { value: "5y", label: "5 سنوات" }, { value: "6y", label: "6 سنوات" },
];

const filterableCriterion = (id: string): id is MarketCriterion => ["best_category", "tbills", "usd_egp", "gold_egp", "egx30"].includes(id);

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
  const criteria = data?.benchmarkCriteria ?? [];
  const readyCriteria = criteria.filter((chip) => chip.state === "ready" && chip.mode === "filter" && filterableCriterion(chip.id));
  const unavailableCriteria = criteria.filter((chip) => chip.state !== "ready" || chip.mode !== "filter");
  const selectedCriterion = criteria.find((chip) => chip.id === criterion);
  const activeFilters = [
    search ? { label: `بحث: ${search}`, clear: () => setSearch("") } : null,
    category !== ALL ? { label: `الفئة: ${category}`, clear: () => setCategory(ALL) } : null,
    manager !== ALL ? { label: `المدير: ${manager}`, clear: () => setManager(ALL) } : null,
    fundType !== ALL ? { label: `النوع: ${fundType}`, clear: () => setFundType(ALL) } : null,
    currency !== ALL ? { label: `العملة: ${currency}`, clear: () => setCurrency(ALL) } : null,
    activeStatus !== "all" ? { label: activeStatus === "active" ? "نشط" : "غير نشط", clear: () => setActiveStatus("all") } : null,
    availability !== ALL ? { label: `البيانات: ${availability}`, clear: () => setAvailability(ALL) } : null,
    period !== "all" ? { label: `الأفق: ${periods.find((item) => item.value === period)?.label}`, clear: () => setPeriod("all") } : null,
    criterion ? { label: selectedCriterion?.label ?? criterion, clear: () => setCriterion(null) } : null,
  ].filter((item): item is { label: string; clear: () => void } => Boolean(item));
  const clear = () => { setSearch(""); setCategory(ALL); setManager(ALL); setFundType(ALL); setCurrency(ALL); setActiveStatus("all"); setAvailability(ALL); setPeriod("all"); setCriterion(null); };
  const exportCsv = () => {
    const href = URL.createObjectURL(new Blob([buildFundUniverseCsv(items)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = href; anchor.download = `nile-fund-universe-${data?.asOfDate ?? "export"}.csv`; anchor.click(); URL.revokeObjectURL(href);
  };

  return <ProductShell title="دليل الصناديق" eyebrow="FUND UNIVERSE / VERIFIED CATALOG" description="اكتشف الكون الاستثماري المصري عبر شروط معلنة وأدلة محفوظة؛ لا تستخدم المنصة مؤشرات بديلة أو نتائج تقديرية.">
    <section className="platform-kpis">{[{ label: "إجمالي الدليل", value: data?.summary.total, note: "سجلات قاعدة البيانات" }, { label: "صندوق نشط", value: data?.summary.active, note: "حالة الكتالوج" }, { label: "NAV حالي موثق", value: data?.summary.withCurrentNav, note: "حتى تاريخ القاهرة" }, { label: "SmartScore متاح", value: data?.summary.scored, note: data?.reportDate ?? "—" }].map(item => <article key={item.label}><span>{item.label}</span><strong>{isLoading ? "…" : fmt(item.value, 0)}</strong><small>{item.note}</small></article>)}</section>

    <section className="filter-workbench" aria-label="منضدة تصفية دليل الصناديق">
      <header className="filter-workbench-head"><div><p className="eyebrow">RESEARCH COMMAND / AND LOGIC</p><h2>صمّم شاشة البحث الخاصة بك</h2><p>تجتمع الشروط النشطة بمنطق <b>AND</b>، ولا تدخل المرجعية إلا عند اكتمال سلسلتها المتوافقة.</p></div><div className="filter-result-pulse" aria-live="polite"><span>نتائج مطابقة</span><b className="mono">{isLoading ? "…" : fmt(items.length, 0)}</b><small>من {fmt(data?.summary.total, 0)} صندوق</small></div></header>

      <div className="filter-command-deck"><div className="filter-search prominent"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث بالاسم أو شركة الإدارة…" aria-label="البحث باسم الصندوق أو المدير" /></div><FilterSelect label="الفئة" compact value={category} onChange={setCategory} values={data?.facets.categories ?? []} /><FilterSelect label="أفق الأداء" compact value={period} onChange={value => setPeriod(value as TrackRecordPeriod)} values={periods.map(item => item.value)} labels={Object.fromEntries(periods.map(item => [item.value, item.label]))} includeAll={false} /><button type="button" className="filter-action reset" onClick={clear} disabled={!activeFilters.length}><RefreshCcw size={15} />إعادة ضبط</button><button type="button" className="filter-action export" onClick={exportCsv} disabled={!items.length}><Download size={15} />تصدير CSV</button></div>

      <div className="active-filter-strip" aria-label="الشروط النشطة"><span><SlidersHorizontal size={14} />{activeFilters.length ? `${activeFilters.length} شروط نشطة` : "لا توجد شروط إضافية"}</span>{activeFilters.map((item) => <button type="button" key={item.label} onClick={item.clear}>{item.label}<b aria-hidden>×</b></button>)}</div>

      <details className="filter-disclosure"><summary><span><Filter size={16} />خصائص الصندوق الإضافية</span><small>شركة الإدارة، النوع، العملة، الحالة، وجودة البيانات</small><ChevronDown size={17} /></summary><div className="filter-disclosure-body"><FilterSelect label="شركة الإدارة" value={manager} onChange={setManager} values={data?.facets.managers ?? []} /><FilterSelect label="نوع الصندوق" value={fundType} onChange={setFundType} values={data?.facets.fundTypes ?? []} /><FilterSelect label="العملة" value={currency} onChange={setCurrency} values={data?.facets.currencies ?? []} /><FilterSelect label="الحالة" value={activeStatus} onChange={value => setActiveStatus(value as UniverseFilters["activeStatus"])} values={["active", "inactive"]} labels={{ active: "نشط", inactive: "غير نشط" }} /><FilterSelect label="توافر البيانات" value={availability} onChange={setAvailability} values={data?.facets.dataAvailability ?? []} labels={{ complete: "مكتملة", partial: "جزئية", limited: "محدودة" }} /></div></details>

      <section className="benchmark-lens" aria-label="مرجعيات الأداء"><header><div><p className="eyebrow">BENCHMARK LENSES / VERIFIED SERIES</p><h3>مرجعيات الأداء</h3><p>تعمل الشرائح الخضراء كشرط تصفية. أما المرجعيات الناقصة فتبقى مكشوفة السبب ولا تُستبدل.</p></div><span>{readyCriteria.length} قابلة للتصفية</span></header><div className="criterion-ready-row">{readyCriteria.map((chip) => {
        const criterionId = chip.id as MarketCriterion;
        return <button type="button" key={chip.id} title={chip.note} aria-pressed={criterion === criterionId} className={`criterion-chip-ready ${criterion === criterionId ? "active" : ""}`} onClick={() => setCriterion(current => current === criterionId ? null : criterionId)}><b>{chip.label}</b><small>{chip.observations ? `${chip.observations} تواريخ موثقة` : "حسب الفئة"}</small></button>;
      })}</div>{unavailableCriteria.length > 0 && <details className="unavailable-benchmarks"><summary><CircleAlert size={15} />{unavailableCriteria.length} مرجعيات غير قابلة للتفعيل حاليًا<ChevronDown size={15} /></summary><div>{unavailableCriteria.map((chip) => <article key={chip.id}><b>{chip.label}</b><span>{chip.note}</span></article>)}</div></details>}</section>
    </section>

    <section className="universe-results"><div className="result-toolbar"><div><p className="eyebrow">FILTERED CATALOG / AND LOGIC</p><b>{fmt(items.length, 0)} نتيجة مطابقة</b></div><select value={sort} onChange={event => setSort(event.target.value)} aria-label="ترتيب النتائج"><option value="score">SmartScore: الأعلى أولًا</option><option value="ytd">أداء YTD: الأعلى أولًا</option><option value="evidence">قوة الأدلة: الأعلى أولًا</option><option value="name">الاسم: أبجديًا</option></select></div>{error ? <div className="platform-empty">تعذر تحميل دليل الصناديق. لا تُعرض بيانات بديلة.</div> : <div className="universe-grid">{items.map(item => <article className="fund-universe-card" key={item.fundId} onClick={() => setLocation(`/funds/${encodeURIComponent(item.fundId)}`)}><div className="fund-card-head"><span className={`availability-dot ${item.dataAvailability}`} /><span>{item.fundType}</span><ArrowUpLeft size={15} /></div><h2>{item.canonicalName}</h2><p>{item.manager ?? "شركة الإدارة غير متاحة"}</p><div className="fund-stat-grid"><span><small>SmartScore</small><b className="mono">{fmt(item.smartScore)}</b></span><span><small>YTD</small><b className="mono">{item.returns.ytd === null ? "—" : `${fmt(item.returns.ytd)}%`}</b></span><span><small>Evidence</small><b className="mono">{fmt(item.evidenceScore, 0)}</b></span></div><footer><span>{item.currency ?? "—"}</span><span>{item.trackRecord ?? "غير مقيم"}</span>{item.verifiedSnapshot ? <span className="verified-label"><ShieldCheck size={12} />NAV موثق</span> : <span><Database size={12} />NAV غير متاح</span>}</footer></article>)}</div>}{!isLoading && !items.length && !error && <div className="platform-empty"><Sparkles size={20} />لا توجد نتائج تحقق جميع الشروط المحددة. أزل شرطًا أو أعد ضبط الفلاتر.</div>}</section><p className="public-disclosure">التصنيف هنا بحثي وتاريخي فقط. التصدير يعكس النتائج المصفاة الحالية، ولا يمثل وجود الصندوق أو ترتيبه توصية استثمارية شخصية.</p>
  </ProductShell>;
}

function FilterSelect({ label, value, onChange, values, labels, includeAll = true, compact = false }: { label: string; value: string; onChange: (value: string) => void; values: readonly string[]; labels?: Record<string, string>; includeAll?: boolean; compact?: boolean }) {
  return <label className={compact ? "compact-filter" : undefined}><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}>{includeAll && <option value={ALL}>الكل</option>}{values.map(item => <option value={item} key={item}>{labels?.[item] ?? item}</option>)}</select></label>;
}
