import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "bolt",
    title: "24-hour dispatch planning",
    text: "PuLP/CBC mixed-integer optimization decides solar, wind, battery and diesel for every hour.",
  },
  {
    icon: "health_and_safety",
    title: "Critical load protection",
    text: "P1 loads are served first; flexible P4 demand is reduced only when supply is truly short.",
  },
  {
    icon: "psychology",
    title: "Explainable decisions",
    text: "Every hour carries a rule-generated explanation with its numeric evidence.",
  },
  {
    icon: "cloud",
    title: "Live weather, offline fallback",
    text: "Optional Open-Meteo forecasts with a committed prepared dataset as the default judge path.",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">GridMitra</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/about" className="text-on-surface-variant hover:text-on-surface">About</Link>
            <Link to="/select" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors">
              Open the app
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-mono font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Off-grid energy decision support
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold text-primary tracking-tight">
            Decide the energy mix before the sun sets.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-secondary text-base leading-relaxed">
            GridMitra recommends an hourly plan for solar, wind, battery and diesel over the next
            24 hours — balancing cost, carbon and reliability for off-grid communities. It supports
            the operator; it does not control hardware.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/select" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              Load Demo Community
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container-low border border-outline-variant text-sm font-semibold rounded-xl hover:bg-surface-container transition-colors">
              Learn more
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[20px]">{feature.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">{feature.title}</h3>
              <p className="mt-1.5 text-xs text-secondary leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-outline-variant">
          <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-secondary">
            Results are calculated estimates for the selected scenario — not field measurements.
          </div>
        </section>
      </main>
    </div>
  );
}