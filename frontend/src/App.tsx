import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppProvider";
import { Login } from "./pages/Login";
import { AppShell } from "./components/layout/AppShell";
import { SiteSelection } from "./pages/SiteSelection";
import { Overview } from "./pages/Overview";
import { Configuration } from "./pages/Configuration";
import { Forecast } from "./pages/Forecast";
import { Dispatch } from "./pages/Dispatch";
import { ScenarioLab } from "./pages/ScenarioLab";
import { ImpactComparison } from "./pages/ImpactComparison";
import { History } from "./pages/History";

function AppRoutes() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SiteSelection />} />
          <Route element={<AppShell />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/scenario-lab" element={<ScenarioLab />} />
            <Route path="/impact" element={<ImpactComparison />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center text-sm text-secondary">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Login />;
  }
  return <AppRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}