import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/overview", label: "Overview", icon: "dashboard" },
    { path: "/scenarios", label: "Scenarios", icon: "folder_open" },
    { path: "/configuration", label: "Microgrid Configuration", icon: "tune" },
    { path: "/forecast", label: "Forecast & Demand", icon: "stacked_line_chart" },
    { path: "/dispatch", label: "Dispatch Planner", icon: "bolt" },
    { path: "/scenario-lab", label: "Scenario Lab", icon: "science" },
    { path: "/impact", label: "Impact Comparison", icon: "compare_arrows" },
    { path: "/history", label: "Optimization History", icon: "history" },
    { path: "/documents", label: "Documents", icon: "description" },
    { path: "/support", label: "Support", icon: "help" },
    { path: "/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col justify-between p-3 select-none">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2 pt-1 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary tracking-tight leading-tight">GridMitra</span>
          </div>
        </div>

        <div className="px-1">
          <button 
            onClick={() => navigate('/dispatch')} 
            className="w-full flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-on-primary py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Solve Dispatch</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={isActive ? { backgroundColor: "#F8F5EE" } : {}}
                className={`flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                  isActive 
                    ? "text-primary font-semibold shadow-xs" 
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[18px]" 
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
