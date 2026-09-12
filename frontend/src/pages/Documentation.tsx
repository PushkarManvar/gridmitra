const SECTIONS = [
  {
    id: "workflow",
    title: "Operator Workflow",
    bullets: [
      "Sign in, then load a community (demo or your own).",
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
      "The optimizer is a mixed-integer linear program (MILP) solved with PuLP and CBC. It plans a full 24-hour horizon of one-hour intervals, and each interval uses kWh for energy and kW for capacity.",
      "For every hour it decides renewable use, battery charge or discharge (never both at once), diesel output, and unserved energy per priority.",
      "A soft terminal reserve keeps stress scenarios solvable: a shortfall is reported and explained instead of failing the solve.",
    ],
  },
  {
    id: "objective",
    title: "What the Optimizer Minimizes",
    body: [
      "The solver finds the plan with the lowest total cost across all 24 hours, balancing economics against reliability. It minimizes:",
    ],
    bullets: [
      "Diesel fuel cost — litres burned × fuel price per litre.",
      "Diesel carbon cost — CO2 emitted × the configured carbon price.",
      "Battery wear cost — charge + discharge energy × wear cost per kWh.",
      "Unserved-load penalties — for each reduced priority.",
      "Terminal reserve shortfall penalty — for ending below the battery reserve target.",
    ],
    bodyAfter: [
      "Penalties are weighted so the priority order is strict: one unit of a higher-priority violation can never be justified by saving all lower-priority cost. P1 is always more important than the end-of-horizon reserve, so the optimizer never interrupts a current critical load just to hold battery energy for later.",
    ],
  },
  {
    id: "constraints",
    title: "Physical Rules the Plan Must Respect",
    body: [
      "Every hourly plan is constrained by the community's real equipment, so the result is always physically feasible:",
    ],
    bullets: [
      "Energy balance — solar + wind + diesel + battery discharge must exactly equal served load + battery charge each hour.",
      "Renewable limits — solar and wind used can never exceed what is available; surplus is curtailed.",
      "Battery transition — stored energy follows charge/discharge through efficiency, staying between its minimum and maximum.",
      "No simultaneous charging and discharging — the battery either charges, discharges, or idles.",
      "Diesel limit — generation capped at generator capacity.",
      "Unserved limits — demand can only be reduced by what actually exists in that hour.",
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

function Body({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mt-2 text-sm text-secondary leading-relaxed">{paragraph}</p>
      ))}
    </>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((bullet, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-secondary leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {bullet}
        </li>
      ))}
    </ul>
  );
}

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
                <Body paragraphs={section.body ?? []} />
                {section.bullets && <Bullets items={section.bullets} />}
                {section.bodyAfter && <Body paragraphs={section.bodyAfter} />}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}