import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AppProvider } from "./context/AppProvider";
import { AppShell } from "./components/layout/AppShell";
import { About } from "./pages/About";
import { SiteSelection } from "./pages/SiteSelection";
import { Overview } from "./pages/Overview";
import { Configuration } from "./pages/Configuration";
import { Forecast } from "./pages/Forecast";
import { Dispatch } from "./pages/Dispatch";
import { ScenarioLab } from "./pages/ScenarioLab";
import { ImpactComparison } from "./pages/ImpactComparison";
import { History } from "./pages/History";
import { Scenarios } from "./pages/Scenarios";
import { ScenarioEditor } from "./pages/ScenarioEditor";
import { Documentation } from "./pages/Documentation";
import { Settings } from "./pages/Settings";
import { Support } from "./pages/Support";
import { Login } from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function LoginRoute() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/overview" replace />;
  return <Login />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/about" element={<About />} />
          <Route
            element={
              <RequireAuth>
                <Outlet />
              </RequireAuth>
            }
          >
            <Route path="/" element={<SiteSelection />} />
            <Route element={<AppShell />}>
              <Route path="/overview" element={<Overview />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/scenario-lab" element={<ScenarioLab />} />
              <Route path="/scenarios" element={<Scenarios />} />
              <Route path="/scenarios/edit" element={<ScenarioEditor />} />
              <Route path="/impact" element={<ImpactComparison />} />
              <Route path="/history" element={<History />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}