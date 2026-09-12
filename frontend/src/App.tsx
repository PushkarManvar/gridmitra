import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import { AppShell } from "./components/layout/AppShell";
import { SiteSelection } from "./pages/SiteSelection";
import { Overview } from "./pages/Overview";
import { Configuration } from "./pages/Configuration";
import { Forecast } from "./pages/Forecast";
import { Dispatch } from "./pages/Dispatch";
import { ScenarioLab } from "./pages/ScenarioLab";
import { ImpactComparison } from "./pages/ImpactComparison";
import { History } from "./pages/History";

export default function App() {
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