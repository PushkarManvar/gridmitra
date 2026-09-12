import { useLocation } from "react-router-dom";
import { StatusBadge } from "../ui/StatusBadge";

export function TopBar() {
  const location = useLocation();
  const currentPath = location.pathname;

  let currentSection = "Overview";
  if (currentPath === "/configuration") currentSection = "Microgrid Configuration";
  if (currentPath === "/forecast") currentSection = "Forecast & Demand";
  if (currentPath === "/dispatch") currentSection = "Dispatch Planner";
  if (currentPath === "/scenario-lab") currentSection = "Scenario Lab";
  if (currentPath === "/impact") currentSection = "Impact Comparison";
  if (currentPath === "/history") currentSection = "Optimization History";

  const currentDetail = "Demo Community";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 pl-60 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <span>GridMitra</span>
          <span className="text-outline-variant font-mono">/</span>
          <span className="text-primary font-semibold">{currentSection}</span>
        </div>
        <div className="h-4 w-px bg-outline-variant mx-1"></div>
        <button className="flex items-center gap-2 px-2.5 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-lg text-xs font-medium hover:bg-secondary-container transition-colors">
          <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
          <span>{currentDetail}</span>
          <span className="material-symbols-outlined text-[13px]">expand_more</span>
        </button>
        <StatusBadge status="system_ready" />
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-secondary">
          <span className="material-symbols-outlined text-[14px] text-primary">sync</span>
          <span>Telemetry Synced</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" title="Notifications">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" title="Help">
          <span className="material-symbols-outlined text-[18px]">help</span>
        </button>
        <div className="h-4 w-px bg-outline-variant mx-1"></div>
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center text-[11px] font-mono font-bold ring-1 ring-outline-variant">
            OP
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold leading-none text-on-surface">Operator 01</span>
            <span className="text-[10px] text-secondary font-mono">Tier-1 Dispatch</span>
          </div>
        </div>
      </div>
    </header>
  );
}
