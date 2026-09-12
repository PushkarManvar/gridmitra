import { useNavigate } from "react-router-dom";

export function SiteSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface-container-low border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
        </div>
        <h1 className="text-display-lg-mobile font-display-lg-mobile text-primary tracking-tight mb-2">GridMitra</h1>
        <p className="text-body-md text-secondary mb-8">Off-Grid Energy OS. Select a site to begin operations.</p>
        <button 
          onClick={() => navigate('/overview')}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary py-3 px-4 rounded-lg text-body-md font-semibold transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          Load Demo Community
        </button>
      </div>
    </div>
  );
}
