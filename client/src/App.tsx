import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import SharedDashboard from "./pages/SharedDashboard";
import Sphere from "./pages/Sphere";
import SphereView from "./pages/SphereView";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Let the auth check complete
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/share/:token" component={SharedDashboard} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard">
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </Route>
          <Route path="/settings">
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </Route>
          <Route path="/sphere">
            <DashboardLayout>
              <Sphere />
            </DashboardLayout>
          </Route>
          <Route path="/sphere/:id">
            <DashboardLayout>
              <SphereView />
            </DashboardLayout>
          </Route>
        </>
      )}
      
      <Route path="/404" component={NotFound} />
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
        defaultTheme="light"
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
