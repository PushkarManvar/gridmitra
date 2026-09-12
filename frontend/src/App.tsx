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

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route element={<Outlet />}>
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