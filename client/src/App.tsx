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
import { getLoginUrl } from "./const";

// ProtectedRoute MUST be defined outside of Router to avoid remounting on every Router re-render.
// Defining a component inside another component creates a new component type on every render,
// which causes React to unmount and remount the entire subtree, destroying all state.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  // Wait for initial auth check before redirecting
  if (loading && !user) return null;
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  return <>{children}</>;
}

function Router() {
  const { loading, user } = useAuth();

  // Only block rendering on the very first auth check (no user data yet).
  // Do NOT return null during subsequent auth.me refetches — that would
  // unmount the entire route tree and destroy all component state (e.g., open modals).
  if (loading && !user) {
    return null; // Let the initial auth check complete
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/share/:token" component={SharedDashboard} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/sphere">
        <ProtectedRoute>
          <DashboardLayout>
            <Sphere />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/sphere/:id">
        <ProtectedRoute>
          <DashboardLayout>
            <SphereView />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
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
