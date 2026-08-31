import ProductShell from "@/components/ProductShell";
import { trpc } from "@/lib/trpc";
import {
  buildFundUniverseCsv,
  filterUniverseItems,
  type MarketCriterion,
  type TrackRecordPeriod,
  type UniverseFilters,
} from "@/lib/universeFilters";
import {
  ArrowUpLeft,
  CircleAlert,
  Database,
  Download,
  Filter,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const fmt = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
        useGrouping: false,
      }).format(value);

const ALL = "__all__";

const periods: Array<{ value: TrackRecordPeriod; label: string }> = [
  { value: "all", label: "كل الآفاق" },
  { value: "last12m", label: "12 شهرًا" },
  { value: "1y", label: "سنة واحدة" },
  { value: "2y", label: "سنتان" },
  { value: "3y", label: "3 سنوات" },
  { value: "4y", label: "4 سنوات" },
  { value: "5y", label: "5 سنوات" },
  { value: "6y", label: "6 سنوات" },
];

const filterableCriterion = (id: string): id is MarketCriterion =>
  ["best_category", "tbills", "usd_egp", "gold_egp", "egx30"].includes(id);

export default function FundUniverse() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = trpc.platform.universe.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
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

  const filters = useMemo<UniverseFilters>(
    () => ({
      search,
      category,
      manager,
      fundType,
      currency,
      activeStatus,
      availability,
      period,
      criterion,
    }),
    [search, category, manager, fundType, currency, activeStatus, availability, period, criterion],
  );

  const items = useMemo(() => {
    const filtered = filterUniverseItems(data?.items ?? [], filters);
    return [...filtered].sort((a, b) => {
      if (sort === "ytd") return (b.returns.ytd ?? -Infinity) - (a.returns.ytd ?? -Infinity);
      if (sort === "evidence") return (b.evidenceScore ?? -1) - (a.evidenceScore ?? -1);
      if (sort === "name") return a.canonicalName.localeCompare(b.canonicalName);
      return (b.smartScore ?? -1) - (a.smartScore ?? -1);
    });
  }, [data, filters, sort]);

  const criteria = data?.benchmarkCriteria ?? [];
  const readyCriteria = criteria.filter(
    (chip) => chip.state === "ready" && chip.mode === "filter" && filterableCriterion(chip.id),
  );
  const unavailableCriteria = criteria.filter((chip) => chip.state !== "ready" || chip.mode !== "filter");
  const selectedCriterion = criteria.find((chip) => chip.id === criterion);

  const activeFilters = [
    search ? { label: `بحث: ${search}`, clear: () => setSearch("") } : null,
    category !== ALL ? { label: `الفئة: ${category}`, clear: () => setCategory(ALL) } : null,
    manager !== ALL ? { label: `المدير: ${manager}`, clear: () => setManager(ALL) } : null,
    fundType !== ALL ? { label: `النوع: ${fundType}`, clear: () => setFundType(ALL) } : null,
    currency !== ALL ? { label: `العملة: ${currency}`, clear: () => setCurrency(ALL) } : null,
    activeStatus !== "all"
      ? { label: activeStatus === "active" ? "نشط" : "غير نشط", clear: () => setActiveStatus("all") }
      : null,
    availability !== ALL ? { label: `البيانات: ${availability}`, clear: () => setAvailability(ALL) } : null,
    period !== "all"
      ? { label: `الأفق: ${periods.find((item) => item.value === period)?.label}`, clear: () => setPeriod("all") }
      : null,
    criterion ? { label: selectedCriterion?.label ?? criterion, clear: () => setCriterion(null) } : null,
  ].filter((item): item is { label: string; clear: () => void } => Boolean(item));

  const clear = () => {
    setSearch("");
    setCategory(ALL);
    setManager(ALL);
    setFundType(ALL);
    setCurrency(ALL);
    setActiveStatus("all");
    setAvailability(ALL);
    setPeriod("all");
    setCriterion(null);
  };

  const exportCsv = () => {
    const href = URL.createObjectURL(new Blob([buildFundUniverseCsv(items)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `nile-fund-universe-${data?.asOfDate ?? "export"}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  const kpis = [
    { label: "إجمالي الدليل", value: data?.summary.total, note: "سجلات قاعدة البيانات" },
    { label: "صندوق نشط", value: data?.summary.active, note: "حالة الكتالوج" },
    { label: "NAV موثق", value: data?.summary.withCurrentNav, note: "حتى تاريخ القاهرة" },
    { label: "SmartScore متاح", value: data?.summary.scored, note: data?.reportDate ?? "—" },
  ];

  return (
    <ProductShell
      title="دليل الصناديق"
      eyebrow="SCREENER · FUND UNIVERSE"
      description="ضع شروطك بنفسك. النتائج تتبع منطق AND، وSmartScore طبقة تقييم للجودة وليس بديلًا عن العائد."
    >
      <section className="platform-kpis" aria-label="ملخص الدليل">
        {kpis.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{isLoading ? "…" : fmt(item.value, 0)}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <section className="filter-workbench" aria-label="منضدة تصفية دليل الصناديق">
        <header className="filter-workbench-head">
          <div>
            <p className="eyebrow">FILTER · AND LOGIC</p>
            <h2>اختبر الصناديق بشروطك</h2>
            <p>
              ابحث بالاسم، ثم ضيّق الفئة والمدير والأفق. المرجعيات الجاهزة فقط تدخل كفلتر — لا تُفترض سلاسل ناقصة.
            </p>
          </div>
          <div className="filter-result-pulse" aria-live="polite">
            <span>نتائج مطابقة</span>
            <strong className="mono">{isLoading ? "…" : fmt(items.length, 0)}</strong>
            <small>من أصل {fmt(data?.summary.total, 0)}</small>
          </div>
        </header>

        <div className="filter-command-bar">
          <label className="filter-search">
            <Search size={15} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم الصندوق أو المدير…"
              aria-label="بحث في دليل الصناديق"
            />
          </label>
          <div className="filter-select-grid">
            <FilterSelect
              label="الفئة"
              value={category}
              onChange={setCategory}
              values={data?.facets.categories ?? []}
            />
            <FilterSelect
              label="المدير"
              value={manager}
              onChange={setManager}
              values={data?.facets.managers ?? []}
            />
            <FilterSelect
              label="النوع"
              value={fundType}
              onChange={setFundType}
              values={data?.facets.fundTypes ?? []}
            />
            <FilterSelect
              label="العملة"
              value={currency}
              onChange={setCurrency}
              values={data?.facets.currencies ?? []}
            />
            <FilterSelect
              label="الحالة"
              value={activeStatus}
              onChange={(value) => setActiveStatus(value as UniverseFilters["activeStatus"])}
              values={["active", "inactive"]}
              labels={{ active: "نشط", inactive: "غير نشط" }}
            />
            <FilterSelect
              label="اكتمال البيانات"
              value={availability}
              onChange={setAvailability}
              values={data?.facets.availability ?? []}
            />
            <FilterSelect
              label="أفق الأداء"
              value={period}
              onChange={(value) => setPeriod(value as TrackRecordPeriod)}
              values={periods.map((item) => item.value)}
              labels={Object.fromEntries(periods.map((item) => [item.value, item.label]))}
              includeAll={false}
            />
            <label>
              <span>الترتيب</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="score">SmartScore</option>
                <option value="ytd">YTD</option>
                <option value="evidence">قوة الأدلة</option>
                <option value="name">الاسم</option>
              </select>
            </label>
          </div>
        </div>

        {readyCriteria.length > 0 && (
          <div className="benchmark-chip-row" aria-label="فلاتر المرجعيات الجاهزة">
            <span className="chip-row-label">
              <Filter size={13} /> اختبر مقابل مرجع جاهز
            </span>
            <div className="chip-row">
              {readyCriteria.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={criterion === chip.id ? "active" : ""}
                  onClick={() => setCriterion(criterion === chip.id ? null : (chip.id as MarketCriterion))}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {unavailableCriteria.length > 0 && (
          <p className="filter-soft-note">
            <CircleAlert size={13} /> بعض المرجعيات غير جاهزة كفلتر حاليًا ولا تُفرض على النتائج.
          </p>
        )}

        <div className="active-filter-bar">
          <div className="active-filter-chips">
            {activeFilters.length ? (
              activeFilters.map((item) => (
                <button key={item.label} type="button" onClick={item.clear} className="active-chip">
                  {item.label} ×
                </button>
              ))
            ) : (
              <span className="no-active-filters">لا توجد شروط نشطة — اعرض الدليل كاملًا أو أضف فلترًا.</span>
            )}
          </div>
          <div className="filter-actions">
            <button type="button" onClick={clear} disabled={!activeFilters.length}>
              <RefreshCcw size={14} /> إعادة ضبط
            </button>
            <button type="button" onClick={exportCsv} disabled={!items.length}>
              <Download size={14} /> تصدير CSV
            </button>
          </div>
        </div>
      </section>

      <section className="universe-results" aria-label="نتائج الدليل">
        <header className="universe-results-head">
          <div>
            <p className="eyebrow">RESULTS</p>
            <h2>الصناديق المطابقة</h2>
          </div>
          <span className="mono">
            {isLoading ? "…" : fmt(items.length, 0)} نتيجة
          </span>
        </header>

        {error ? (
          <div className="platform-empty">
            تعذر تحميل دليل الصناديق. لا تُعرض بيانات بديلة.
          </div>
        ) : (
          <div className="universe-grid">
            {items.map((item) => (
              <article
                className="fund-universe-card"
                key={item.fundId}
                onClick={() => setLocation(`/funds/${encodeURIComponent(item.fundId)}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setLocation(`/funds/${encodeURIComponent(item.fundId)}`);
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <div className="fund-card-head">
                  <span className={`availability-dot ${item.dataAvailability}`} />
                  <span>{item.fundType}</span>
                  <ArrowUpLeft size={15} aria-hidden="true" />
                </div>
                <h2>{item.canonicalName}</h2>
                <p>{item.manager ?? "شركة الإدارة غير متاحة"}</p>
                <div className="fund-stat-grid">
                  <span>
                    <small>SmartScore</small>
                    <b className="mono">{fmt(item.smartScore)}</b>
                  </span>
                  <span>
                    <small>YTD</small>
                    <b className="mono">
                      {item.returns.ytd === null ? "—" : `${fmt(item.returns.ytd)}%`}
                    </b>
                  </span>
                  <span>
                    <small>Evidence</small>
                    <b className="mono">{fmt(item.evidenceScore, 0)}</b>
                  </span>
                </div>
                <footer>
                  <span>{item.currency ?? "—"}</span>
                  <span>{item.trackRecord ?? "غير مقيم"}</span>
                  {item.verifiedSnapshot ? (
                    <span className="verified-label">
                      <ShieldCheck size={12} /> NAV موثق
                    </span>
                  ) : (
                    <span>
                      <Database size={12} /> NAV غير متاح
                    </span>
                  )}
                </footer>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !items.length && !error && (
          <div className="platform-empty">
            <Sparkles size={20} />
            لا توجد نتائج تحقق جميع الشروط. أزل شرطًا أو أعد ضبط الفلاتر.
          </div>
        )}
      </section>

      <p className="public-disclosure">
        التصنيف هنا بحثي وتاريخي فقط. التصدير يعكس النتائج المصفاة الحالية، ولا يمثل وجود الصندوق أو ترتيبه توصية استثمارية.
      </p>
    </ProductShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  values,
  labels,
  includeAll = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  values: readonly string[];
  labels?: Record<string, string>;
  includeAll?: boolean;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {includeAll && <option value={ALL}>الكل</option>}
        {values.map((item) => (
          <option value={item} key={item}>
            {labels?.[item] ?? item}
          </option>
        ))}
      </select>
    </label>
  );
}
