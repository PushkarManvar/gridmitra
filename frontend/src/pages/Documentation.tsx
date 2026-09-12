type DocumentationSection = {
  id: string;
  title: string;
  summary: string;
  body?: string[];
  bullets?: string[];
  bodyAfter?: string[];
};

const SECTIONS: DocumentationSection[] = [
  {
    id: "workflow",
    title: "Operator Workflow",
    summary: "The normal path from a prepared scenario to a recommendation you can inspect and export.",
    bullets: [
      "Load the prepared demo community or open one of your own scenarios.",
      "Review the demand forecast, renewable availability, and equipment limits.",
      "Run the 24-hour optimization.",
      "Read the KPIs, hourly dispatch, battery curve, and decision explanations.",
      "Use Scenario Lab to test a change, then run the plan again.",
      "Compare the result with the reactive baseline and export the hourly plan as CSV.",
    ],
  },
  {
    id: "assets",
    title: "Microgrid Assets",
    summary: "The optimizer plans around the equipment and preferences configured for the community.",
    body: [
      "Solar and wind use hourly availability profiles. The plan can use less than what is available, but never more.",
      "The battery has a capacity, minimum and maximum energy bounds, charge and discharge limits, efficiency, and a terminal reserve target.",
      "Diesel has a maximum output, fuel consumption, fuel price, and CO₂ emission factor. A configured carbon price adds the emissions trade-off to the operating cost.",
    ],
  },
  {
    id: "priorities",
    title: "Community Load Priority",
    summary: "Critical demand stays ahead of future reserve and flexible demand when supply is short.",
    body: [
      "Demand is split into four priorities. P1 covers critical services such as a health centre or telecom link. P4 is the most flexible demand and is reduced first when there is a shortage.",
      "The optimizer enforces this order: P1 unserved load > terminal reserve shortfall > P2 > P3 > P4. Safety penalties are controlled by the backend and are never editable in the interface.",
    ],
  },
  {
    id: "model",
    title: "How GridMitra Plans Dispatch",
    summary: "A mixed-integer optimization model prepares a full day of one-hour decisions.",
    body: [
      "The engine uses PuLP with CBC to solve a mixed-integer linear program. It plans 24 one-hour intervals, using kWh for energy in each interval and kW for equipment capacity.",
      "For each hour it chooses renewable use, battery charge or discharge, diesel output, and any unserved energy by priority. The battery cannot charge and discharge at the same time.",
      "A soft terminal reserve keeps stress scenarios solvable. When the target cannot be met, GridMitra reports and explains the reserve shortfall instead of returning an empty plan.",
    ],
  },
  {
    id: "objective",
    title: "What the Optimizer Minimizes",
    summary: "The plan weighs running cost, battery wear, carbon, unserved energy, and end-of-day reserve.",
    body: ["Across the 24-hour horizon, the solver minimizes the following calculated costs and penalties:"],
    bullets: [
      "Diesel fuel cost: litres burned × fuel price per litre.",
      "Diesel carbon cost: CO₂ emitted × the configured carbon price.",
      "Battery wear cost: charged and discharged energy × wear cost per kWh.",
      "Unserved-load penalties: a separate penalty for each reduced priority.",
      "Terminal reserve shortfall penalty: the cost of ending below the battery reserve target.",
    ],
    bodyAfter: ["Penalty weights make the priority order strict. The optimizer will not interrupt a current P1 load merely to preserve battery energy for a later hour."],
  },
  {
    id: "constraints",
    title: "Physical Rules the Plan Must Respect",
    summary: "Every recommendation must obey energy balance and the configured limits of the equipment.",
    bullets: [
      "Energy balance: solar + wind + diesel + battery discharge equals served load + battery charge in every hour.",
      "Renewable limit: solar and wind use cannot exceed available energy; unused surplus is curtailed.",
      "Battery transition: stored energy follows charge and discharge through efficiency while staying within its minimum and maximum bounds.",
      "Battery mode: the battery can charge, discharge, or idle, but never charge and discharge together.",
      "Diesel limit: generation cannot exceed the generator capacity.",
      "Unserved limit: the plan cannot reduce more demand than exists in that hour.",
    ],
  },
  {
    id: "statuses",
    title: "Run Statuses",
    summary: "A completed run can be optimal or an emergency plan; both are usable recommendations.",
    bullets: [
      "optimal: the plan solved without load shedding or a reserve shortfall.",
      "emergency_plan: the plan solved, but demand was reduced or the reserve target was missed. The page includes warnings and the full dispatch result.",
      "failed: the solver did not produce a usable plan, so GridMitra does not display partial values as a result.",
    ],
  },
  {
    id: "baseline",
    title: "Reactive Baseline vs GridMitra",
    summary: "The baseline follows the same equipment limits but makes each hour without looking ahead.",
    body: ["The reactive baseline uses available renewable energy first, then the battery, then diesel. If needed, it sheds P4 through P1. GridMitra can preserve reserve and protect demand that a no-lookahead plan would otherwise give up."],
  },
  {
    id: "data",
    title: "Data Requirements",
    summary: "The core demo uses a validated, reproducible day of hourly input data.",
    body: ["A scenario needs exactly 24 hourly records with solar and wind availability plus P1–P4 demand. GridMitra validates those values before solving. Live weather from Open-Meteo is optional; when it is unavailable, the prepared data remains available."],
  },
];

const NAV_GROUPS = [
  ["Run a plan", ["workflow", "assets", "priorities"]],
  ["Understand the result", ["model", "objective", "constraints", "statuses"]],
  ["Compare and prepare", ["baseline", "data"]],
] as const;

function SectionLabel({ children }: { children: string }) {
  return <p className="doc-title text-xs uppercase tracking-[0.13em] text-primary">{children}</p>;
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return <>
    {paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-7 text-on-surface-variant">{paragraph}</p>)}
  </>;
}

function Bullets({ items }: { items: string[] }) {
  return <ul className="mt-5 space-y-3">
    {items.map((item) => (
      <li key={item} className="grid grid-cols-[16px_1fr] gap-3 text-base leading-7 text-on-surface-variant">
        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>;
}

export function Documentation() {
  return (
    <div className="documentation-page min-h-screen bg-surface-container-lowest text-on-surface">
      <main className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[238px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="doc-title text-sm tracking-tight text-on-surface">GridMitra docs</p>
          <p className="mt-2 max-w-[210px] text-sm leading-6 text-on-surface-variant">A reference for operators, reviewers, and anyone checking how a plan was made.</p>
          <nav aria-label="Documentation sections" className="mt-7 space-y-6">
            {NAV_GROUPS.map(([group, ids]) => (
              <div key={group}>
                <p className="doc-title text-[11px] uppercase tracking-[0.12em] text-secondary">{group}</p>
                <div className="mt-2 flex flex-col border-l border-outline-variant">
                  {ids.map((id) => {
                    const section = SECTIONS.find((item) => item.id === id);
                    return section ? <a key={id} href={`#${id}`} className="px-3 py-1.5 text-sm text-on-surface-variant transition hover:border-l-2 hover:border-primary hover:pl-[11px] hover:text-primary">{section.title}</a> : null;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <article>
          <header className="border-b border-outline-variant pb-10">
            <SectionLabel>Operator reference</SectionLabel>
            <h1 className="mt-4 text-4xl tracking-tight text-on-surface lg:text-5xl">Documentation</h1>
            <p className="mt-5 max-w-3xl text-xl leading-8 text-on-surface-variant">How GridMitra turns one day of demand and renewable forecasts into an hourly, explainable microgrid plan.</p>
          </header>

          <section className="border-b border-outline-variant py-10" aria-labelledby="run-path-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><SectionLabel>Start here</SectionLabel><h2 id="run-path-title" className="mt-2 text-2xl tracking-tight text-on-surface">The path of a saved recommendation</h2></div>
              <p className="max-w-sm text-base leading-7 text-on-surface-variant">The interface never changes the plan by itself. The operator reviews each step.</p>
            </div>
            <div className="mt-7 grid border-y border-outline-variant sm:grid-cols-4">
              {[
                ["01", "Review inputs", "Demand, renewables, and equipment"],
                ["02", "Run the model", "Create a 24-hour recommendation"],
                ["03", "Check decisions", "Read dispatch, reserve, and explanations"],
                ["04", "Compare or export", "Test a scenario and keep the hourly evidence"],
              ].map(([number, title, detail], index) => (
                <div key={title} className={`py-5 ${index === 0 ? "" : "sm:border-l sm:border-outline-variant sm:pl-5"} ${index < 3 ? "border-b border-outline-variant sm:border-b-0" : ""}`}>
                  <p className="doc-title text-sm text-secondary">{number}</p><h3 className="mt-3 text-base text-on-surface">{title}</h3><p className="mt-1 text-sm leading-6 text-on-surface-variant">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="divide-y divide-outline-variant">
            {SECTIONS.map((section, index) => (
              <section key={section.id} id={section.id} className="grid gap-5 py-10 scroll-mt-20 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-10">
                <div>
                  <SectionLabel>{String(index + 1).padStart(2, "0")}</SectionLabel>
                  <h2 className="mt-3 text-2xl leading-tight tracking-tight text-on-surface">{section.title}</h2>
                </div>
                <div>
                  <p className="text-lg leading-7 text-on-surface">{section.summary}</p>
                  {section.body && <Paragraphs paragraphs={section.body} />}
                  {section.bullets && <Bullets items={section.bullets} />}
                  {section.bodyAfter && <Paragraphs paragraphs={section.bodyAfter} />}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
