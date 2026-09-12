import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function SiteSelection() {
  const navigate = useNavigate();
  const { loadDemo, loading, error } = useApp();

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-low border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <h1 className="text-display-lg-mobile font-display-lg-mobile text-primary tracking-tight mb-2">GridMitra</h1>
        <p className="text-body-md text-secondary mb-6">
          Off-Grid Energy decision support. Load a community to begin operations.
        </p>
        <p className="text-xs text-secondary mb-6">
          GridMitra recommends a 24-hour dispatch plan. It does not directly control equipment.
        </p>
        <button
          onClick={() => {
            void loadDemo().then(() => navigate("/overview"));
          }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary py-3 px-4 rounded-lg text-body-md font-semibold transition-colors shadow-sm disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          {loading ? "Loading demo…" : "Load Demo Community"}
        </button>
        {error && (
          <p className="mt-4 text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3 text-left">
            <strong>Could not load the demo.</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
}