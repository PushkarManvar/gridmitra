import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export function TopBar() {
  const location = useLocation();
  const { scenario } = useApp();
  const currentPath = location.pathname;

  let currentSection = "Overview";
  if (currentPath === "/configuration") currentSection = "Microgrid Configuration";
  if (currentPath === "/forecast") currentSection = "Forecast & Demand";
  if (currentPath === "/dispatch") currentSection = "Dispatch Planner";
  if (currentPath === "/scenario-lab") currentSection = "Scenario Lab";
  if (currentPath === "/impact") currentSection = "Impact Comparison";
  if (currentPath === "/history") currentSection = "Optimization History";

  const currentDetail = scenario?.scenario_name ?? "Demo Community";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 pl-60 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <span>GridMitra</span>
          <span className="text-outline-variant font-mono">/</span>
          <span className="text-primary font-semibold">{currentSection}</span>
        </div>
        <div className="h-4 w-px bg-outline-variant mx-1" />
        <button className="flex items-center gap-2 px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-lg text-xs font-medium hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
          <span>{currentDetail}</span>
        </button>
      </div>
    </header>
  );
}