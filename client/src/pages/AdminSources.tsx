import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowRight, Database, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US", { useGrouping: false }).format(value);
const formatDateTime = (value: string | null | undefined) => value ? new Date(value).toLocaleString("en-GB", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

export default function AdminSources() {
  const { user, loading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data, error, isLoading } = trpc.dashboard.snapshot.useQuery(undefined, { enabled: isAuthenticated && isAdmin, retry: false, refetchOnWindowFocus: false });
  if (loading) return <div className="access-gate"><div className="access-card"><p className="eyebrow">PRIVATE OPERATIONS</p><h1>يجري التحقق من الوصول</h1></div></div>;
  if (!isAuthenticated) return <div className="access-gate"><div className="access-card"><p className="eyebrow">PRIVATE OPERATIONS</p><h1>هذه صفحة إدارية خاصة</h1><p>سجل المصادر والتشغيل لا يُعرض في الواجهة العامة.</p><button className="access-button" onClick={() => startLogin()}>دخول آمن</button></div></div>;
  if (!isAdmin) return <div className="access-gate"><div className="access-card"><p className="eyebrow">ACCESS RESTRICTED</p><h1>لا تملك صلاحية عرض هذه الصفحة</h1><p>المصادر وسجل تشغيل الوكيل متاحان للمشرفين فقط.</p><Link href="/" className="access-button">العودة للوحة العامة <ArrowRight size={15} /></Link></div></div>;
  return <main className="admin-sources-shell" dir="rtl"><header className="admin-topbar"><div><p className="eyebrow">PRIVATE OPERATIONS / ADMIN ONLY</p><h1>المصادر وسجل التحديث</h1></div><Link href="/" className="back-link"><ArrowRight size={15} />اللوحة العامة</Link></header>{isLoading ? <div className="data-panel empty-state">يجري تحميل السجل الإداري…</div> : error ? <div className="data-panel empty-state">تعذر تحميل السجل الإداري.</div> : <><div className="admin-job-card"><div><p className="eyebrow">MARKET DATA JOB</p><p className="admin-status"><Activity size={17} />{data?.marketJob?.active ? "الجدولة يومية ومفعلة" : "الجدولة غير مفعلة"}</p></div><div><p className="source-muted">آخر تشغيل</p><p className="mono mt-1">{formatDateTime(data?.marketJob?.last_finished_at)}</p></div><div><p className="source-muted">الحالة</p><p className="mono mt-1">{data?.marketJob?.last_status ?? "—"}</p></div></div><section className="data-panel"><div className="panel-head"><h2>صحة مصادر NAV</h2><ShieldCheck size={16} className="text-[#19c39a]" /></div><div className="source-list">{data?.sources.map(source => <div className="source-row" key={source.source_id}><div><p className="font-medium truncate">{source.source_name}</p><p className="source-muted mt-1 mono">{source.source_kind}</p></div><div><p className="source-muted">لقطات</p><p className="mono mt-1">{formatNumber(source.priceCount)}</p></div><div><p className="source-muted">صناديق</p><p className="mono mt-1">{formatNumber(source.coveredFundCount)}</p></div><div><p className="source-muted">آخر تقييم</p><p className="mono mt-1">{source.latestValuationDate ?? "—"}</p></div></div>)}</div></section><p className="private-note"><Database size={14} />هذه بيانات تشغيل داخلية ولا تظهر في اللوحة العامة.</p></>}</main>;
}
