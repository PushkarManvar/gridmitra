const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "GridMitra recommends an hourly dispatch plan for the next 24 hours: how much solar and wind to use, when to charge or discharge the battery, when diesel is needed, and which flexible loads to reduce. It is decision support — it does not control equipment.",
    ],
  },
  {
    id: "workflow",
    title: "Operator Workflow",
    bullets: [
      "Load a community (demo or your own).",
      "Review demand and renewable availability.",
      "Run the 24-hour optimization.",
      "Inspect the dispatch, battery curve and explanations.",
      "Stress-test with the Scenario Lab, then re-optimize.",
      "Compare against the reactive baseline, save, and export CSV.",
    ],
  },
  {
    id: "assets",
    title: "Microgrid Assets",
    body: [
      "Solar and wind capacity with hourly availability profiles.",
      "A battery with capacity, energy bounds, charge/discharge limits, efficiency and a terminal reserve target.",
      "A diesel generator with maximum output, fuel consumption, fuel price and emission factor.",
      "A carbon-price preference that shapes the cost-carbon trade-off.",
    ],
  },
  {
    id: "priorities",
    title: "Community Load Priority",
    body: [
      "Demand is split into four priorities. P1 is critical (health centre, telecom) and is protected first. P4 is flexible and is reduced first when supply is short.",
      "Penalty order enforced by the optimizer: P1 > terminal reserve > P2 > P3 > P4. Safety penalties are backend-controlled and never exposed to the UI.",
    ],
  },
  {
    id: "model",
    title: "How GridMitra Plans Dispatch",
    body: [
      "The optimizer is a mixed-integer linear program solved with PuLP and CBC. For every hour it decides renewable use, battery charge or discharge (never both at once), diesel output, and unserved energy per priority.",
      "A soft terminal reserve keeps stress scenarios solvable: a shortfall is reported and explained instead of failing the solve.",
    ],
  },
  {
    id: "statuses",
    title: "Run Statuses",
    bullets: [
      "optimal — solved with no load shedding or reserve shortfall.",
      "emergency_plan — solved, but some demand was reduced or the reserve target was missed; warnings are returned.",
      "failed — no usable plan; the solver failed before producing values.",
    ],
  },
  {
    id: "baseline",
    title: "Reactive Baseline vs GridMitra",
    body: [
      "A no-lookahead baseline uses renewables first, then the battery, then diesel, shedding P4-to-P1 as needed, without planning for the future. GridMitra's measured value is reliability and reserve discipline: it holds the reserve and serves demand the baseline would shed.",
    ],
  },
  {
    id: "data",
    title: "Data Requirements",
    body: [
      "Exactly 24 hourly records with solar/wind availability and P1–P4 demand. Values are validated before solving. Live weather (Open-Meteo) is optional and falls back to prepared data.",
    ],
  },
];

export function Documentation() {
  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="max-w-[1200px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <nav className="lg:sticky lg:top-20 flex flex-col gap-1 text-sm">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Documentation</h1>
          <p className="mt-1 text-sm text-secondary">How the GridMitra decision-support system works.</p>
          <div className="mt-8 flex flex-col gap-6">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 scroll-mt-20">
                <h2 className="text-base font-bold text-on-surface">{section.title}</h2>
                {section.body?.map((paragraph, index) => (
                  <p key={index} className="mt-2 text-sm text-secondary leading-relaxed">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {section.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-secondary leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}