import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  BarChart3,
  Binoculars,
  BookMarked,
  GitCompareArrows,
  Landmark,
  LayoutDashboard,
  Radar,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { ReactNode } from "react";
import { useLocation } from "wouter";

type NavItem = {
  path: string;
  label: string;
  hint: string;
  icon: typeof Landmark;
};

const primaryNav: NavItem[] = [
  { path: "/", label: "نظرة عامة", hint: "السوق والاقتصاد", icon: Landmark },
  { path: "/discover", label: "اكتشف", hint: "إشارات وفرص", icon: Binoculars },
  { path: "/funds", label: "دليل الصناديق", hint: "فلترة واختبار", icon: WalletCards },
  { path: "/rank", label: "التصنيفات", hint: "ترتيب وSmartScore", icon: BarChart3 },
  { path: "/compare", label: "المقارنة", hint: "جنبًا إلى جنب", icon: GitCompareArrows },
];

const secondaryNav: NavItem[] = [
  { path: "/workspace", label: "مساحة القرار", hint: "ملاحظات ومتابعة", icon: BookMarked },
  { path: "/monitoring", label: "المراقبة", hint: "صحة البيانات", icon: Radar },
  { path: "/scores", label: "التحقق", hint: "المنهجية والأدلة", icon: ShieldCheck },
];

function isActive(location: string, path: string) {
  if (path === "/") return location === "/";
  return location === path || location.startsWith(`${path}/`);
}

export default function ProductShell({
  children,
  title,
  eyebrow,
  description,
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  description?: string;
}) {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();

  return (
    <div className="product-shell" dir="rtl">
      <aside className="product-rail" aria-label="القائمة الرئيسية">
        <button
          className="product-brand"
          onClick={() => setLocation("/")}
          aria-label="العودة إلى الرئيسية"
        >
          <span className="product-brand-mark" aria-hidden="true">
            N
          </span>
          <span>
            <b>مرصد الصناديق المصرية</b>
            <small>EGYPT FUNDS INTELLIGENCE</small>
          </span>
        </button>

        <div className="product-nav-group">
          <p className="product-nav-label">رحلة التحليل</p>
          <nav className="product-nav" aria-label="التنقل الرئيسي">
            {primaryNav.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => setLocation(item.path)}
                className={isActive(location, item.path) ? "active" : ""}
                aria-current={isActive(location, item.path) ? "page" : undefined}
              >
                <item.icon size={16} aria-hidden="true" />
                <span className="product-nav-text">
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="product-nav-group">
          <p className="product-nav-label">أدوات إضافية</p>
          <nav className="product-nav" aria-label="تنقل إضافي">
            {secondaryNav.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => setLocation(item.path)}
                className={isActive(location, item.path) ? "active" : ""}
                aria-current={isActive(location, item.path) ? "page" : undefined}
              >
                <item.icon size={16} aria-hidden="true" />
                <span className="product-nav-text">
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="product-rail-foot">
          <span className="live-dot" aria-hidden="true" />
          <div>
            <span>لقطة موثقة · ليست توصية</span>
            <small>SMARTSCORE v1.0 · EIMA / NAV</small>
          </div>
        </div>
      </aside>

      <div className="product-stage">
        <header className="product-topbar">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          <div className="product-account">
            {loading ? (
              <span className="product-account-muted">…</span>
            ) : user ? (
              <>
                <UserRound size={15} aria-hidden="true" />
                <span>{user.name || "حساب المستخدم"}</span>
              </>
            ) : (
              <button type="button" onClick={() => startLogin()}>
                <UserRound size={15} aria-hidden="true" />
                تسجيل الدخول
              </button>
            )}
            <button
              type="button"
              className="product-icon-btn"
              onClick={() => setLocation("/funds")}
              aria-label="البحث في الصناديق"
            >
              <Search size={15} />
            </button>
            <button
              type="button"
              className="product-icon-btn desktop-only"
              onClick={() => setLocation("/")}
              aria-label="لوحة السوق"
            >
              <LayoutDashboard size={15} />
            </button>
          </div>
        </header>
        <main className="product-main">{children}</main>
      </div>
    </div>
  );
}
