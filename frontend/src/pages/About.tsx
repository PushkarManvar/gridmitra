import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "Problem",
    text: "Rural and off-grid communities rely on diesel generation that is expensive and carbon-intensive, while solar, wind and batteries go underused. Operators must decide hourly: use renewables, charge or discharge the battery, when to run diesel, and which flexible loads to shed when supply is short.",
  },
  {
    title: "Solution",
    text: "GridMitra converts a 24-hour demand and renewable forecast into an explainable dispatch plan. It is a transparent mixed-integer linear program (PuLP + CBC), not a black-box model. Every important decision carries a rule-generated explanation and its numeric evidence.",
  },
  {
    title: "Architecture",
    text: "A React operator dashboard talks to a FastAPI backend. The optimizer is a pure Python module with no React or database dependency. Runs are persisted to PostgreSQL as immutable snapshots, so editing a scenario never rewrites history.",
  },
  {
    title: "Limitations",
    text: "GridMitra is decision support, not a hardware controller. It assumes known 24-hour inputs, uses a simplified turbine power curve, and reports simulated estimates — not field measurements.",
  },
  {
    title: "Team",
    text: "Built by Error 404: PushkarManvar and Bella-M07 (backend, optimization, data), Nishant3634 and Mit-Prajapati (frontend). HackOut'26 · Problem 4 — Microgrid Energy Mix Optimizer.",
  },
];

export function About() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">GridMitra</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-on-surface-variant hover:text-on-surface">Home</Link>
            <Link to="/select" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors">
              Open the app
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-semibold text-primary tracking-tight">About GridMitra</h1>
        <p className="mt-3 text-secondary text-sm leading-relaxed">
          A 24-hour microgrid energy-mix decision-support prototype for off-grid communities.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <section key={section.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="text-base font-bold text-on-surface">{section.title}</h2>
              <p className="mt-2 text-sm text-secondary leading-relaxed">{section.text}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}