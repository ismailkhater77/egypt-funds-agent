import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { BarChart3, Binoculars, BookMarked, GitCompareArrows, Landmark, Radar, Search, UserRound, WalletCards } from "lucide-react";
import { ReactNode } from "react";
import { useLocation } from "wouter";

const menu = [
  { path: "/", label: "ذكاء السوق", icon: Landmark },
  { path: "/funds", label: "دليل الصناديق", icon: WalletCards },
  { path: "/discover", label: "اكتشف", icon: Binoculars },
  { path: "/rank", label: "التصنيفات", icon: BarChart3 },
  { path: "/compare", label: "المقارنة", icon: GitCompareArrows },
  { path: "/workspace", label: "مساحة القرار", icon: BookMarked },
  { path: "/monitoring", label: "المراقبة", icon: Radar },
];

export default function ProductShell({ children, title, eyebrow, description }: { children: ReactNode; title: string; eyebrow: string; description?: string }) {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();
  return <div className="product-shell" dir="rtl"><aside className="product-rail"><button className="product-brand" onClick={() => setLocation("/")} aria-label="العودة إلى الرئيسية"><span className="product-brand-mark">N</span><span><b>مرصد الأسواق المصرية</b><small>NILE MARKET INTELLIGENCE</small></span></button><nav className="product-nav" aria-label="التنقل الرئيسي">{menu.map(item => <button key={item.path} onClick={() => setLocation(item.path)} className={location === item.path || (item.path !== "/" && location.startsWith(item.path)) ? "active" : ""}><item.icon size={16} /><span>{item.label}</span></button>)}</nav><div className="product-rail-foot"><span className="live-dot" />بيانات بحثية موثقة<small>SMARTSCORE v1.0</small></div></aside><div className="product-stage"><header className="product-topbar"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="product-account">{loading ? <span>...</span> : user ? <><UserRound size={15} /><span>{user.name || "حساب المستخدم"}</span></> : <button onClick={() => startLogin()}><UserRound size={15} />تسجيل الدخول</button>}<Search size={15} className="text-[#648f89]" /></div></header><main className="product-main">{children}</main></div></div>;
}
