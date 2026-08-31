import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

const NotFound = lazy(() => import("@/pages/NotFound"));
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
const Home = lazy(() => import("./pages/Home"));
const AdminSources = lazy(() => import("./pages/AdminSources"));
const SmartScores = lazy(() => import("./pages/SmartScores"));
const FundUniverse = lazy(() => import("./pages/FundUniverse"));
const Discover = lazy(() => import("./pages/Discover"));
const Rankings = lazy(() => import("./pages/Rankings"));
const Compare = lazy(() => import("./pages/Compare"));
const FundProfile = lazy(() => import("./pages/FundProfile"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Monitoring = lazy(() => import("./pages/Monitoring"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div className="route-loading" role="status">جاري تجهيز مساحة التحليل…</div>}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/scores"} component={SmartScores} />
      <Route path={"/funds"} component={FundUniverse} />
      <Route path={"/discover"} component={Discover} />
      <Route path={"/rank"} component={Rankings} />
      <Route path={"/compare"} component={Compare} />
      <Route path={"/funds/:fundId"} component={FundProfile} />
      <Route path={"/workspace"} component={Workspace} />
      <Route path={"/monitoring"} component={Monitoring} />
      <Route path={"/admin/sources"} component={AdminSources} />
      <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
