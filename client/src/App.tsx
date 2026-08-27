import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminSources from "./pages/AdminSources";
import SmartScores from "./pages/SmartScores";
import FundUniverse from "./pages/FundUniverse";
import Discover from "./pages/Discover";
import Rankings from "./pages/Rankings";
import Compare from "./pages/Compare";
import FundProfile from "./pages/FundProfile";
import Workspace from "./pages/Workspace";
import Monitoring from "./pages/Monitoring";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
