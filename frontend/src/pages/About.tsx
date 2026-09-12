import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function Label({ children }: { children: ReactNode }) {
  return <p className="about-title text-xs uppercase tracking-[0.14em] text-primary">{children}</p>;
}

export function About() {
  return (
    <div className="about-page min-h-screen bg-surface-container-lowest text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-on-primary"><span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span></span>
            <span className="about-title text-base tracking-tight text-primary">GridMitra</span>
          </Link>
          <Link to="/select" className="about-title text-base text-primary hover:underline">Open the app</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <section className="grid gap-10 border-b border-outline-variant pb-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <Label>Why we built this</Label>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-on-surface lg:text-5xl">About GridMitra</h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-on-surface-variant">A 24-hour microgrid energy-mix decision-support prototype for off-grid communities.</p>
          </div>
          <div className="border-l-2 border-[#D97706] pl-4 pb-1">
            <p className="about-title text-base text-on-surface">An operator needs a plan they can check.</p>
            <p className="mt-2 text-base leading-7 text-on-surface-variant">GridMitra helps plan renewable use, battery reserve, diesel backup, and critical-load protection before the day starts.</p>
          </div>
        </section>

        <section className="border-b border-outline-variant py-10 lg:py-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><Label>How a plan comes together</Label><h2 className="mt-2 text-2xl font-bold tracking-tight text-on-surface">From forecast to an hourly plan</h2></div>
            <p className="max-w-md text-base leading-7 text-on-surface-variant">Each step gives the operator a reason for the next decision.</p>
          </div>
          <div className="mt-7 grid border-y border-outline-variant sm:grid-cols-4">
            {[
              ["01", "Look ahead", "Demand, solar, and wind"],
              ["02", "Set priorities", "P1 loads and reserve target"],
              ["03", "Make the plan", "Renewables, battery, then diesel"],
              ["04", "Check the reasons", "Decision notes with evidence"],
            ].map(([number, title, detail], index) => (
              <div key={title} className={`py-5 ${index === 0 ? "" : "sm:border-l sm:border-outline-variant sm:pl-5"} ${index < 3 ? "border-b border-outline-variant sm:border-b-0" : ""}`}>
                <span className="about-title text-sm text-secondary">{number}</span><h3 className="mt-4 text-base font-bold text-on-surface">{title}</h3><p className="mt-1 text-sm leading-6 text-on-surface-variant">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-outline-variant py-10 lg:grid-cols-2 lg:gap-16 lg:py-12">
          <article><Label>The problem</Label><h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">A difficult hourly trade-off</h2><p className="mt-4 text-base leading-7 text-on-surface-variant">Rural and off-grid communities often rely on diesel generation that is expensive and carbon-intensive, while solar, wind, and batteries go underused. Operators must decide every hour when to use renewables, charge or discharge the battery, run diesel, and shed flexible load when supply is short.</p></article>
          <article><Label>The response</Label><h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">An optimization model an operator can inspect</h2><p className="mt-4 text-base leading-7 text-on-surface-variant">GridMitra turns a 24-hour demand and renewable forecast into an explainable dispatch plan. The model uses PuLP and CBC, and important decisions include a rule-generated explanation with numeric evidence.</p></article>
        </section>

        <section className="border-b border-outline-variant py-10 lg:py-12">
          <div className="max-w-2xl"><Label>How it is built</Label><h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">The parts stay separate on purpose</h2><p className="mt-3 text-base leading-7 text-on-surface-variant">The optimizer stays pure Python. The dashboard presents calculated results, and stored runs remain unchanged after a scenario is edited.</p></div>
          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
            {[
              ["Operator dashboard", "React", "Shows inputs, plans, and explanations"],
              ["Service boundary", "FastAPI", "Validates requests and returns results"],
              ["Optimization engine", "PuLP + CBC", "Pure Python dispatch model"],
              ["Run history", "PostgreSQL", "Immutable input and result snapshots"],
            ].map(([title, technology, detail], index) => (
              <div key={title} className="contents">
                {index > 0 && <div className="hidden place-items-center text-secondary md:grid" aria-hidden="true">→</div>}
                <div className="border border-outline-variant bg-surface-container-low p-4"><p className="about-title text-xs uppercase tracking-[0.1em] text-secondary">{technology}</p><h3 className="mt-2 text-base font-bold text-on-surface">{title}</h3><p className="mt-2 text-sm leading-6 text-on-surface-variant">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-b border-outline-variant py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-12">
          <div><Label>Limitations</Label><h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">Useful, but not autonomous.</h2></div>
          <p className="border-l-2 border-primary pl-5 text-base leading-7 text-on-surface-variant">GridMitra is decision support, not a hardware controller. It assumes known 24-hour inputs, uses a simplified turbine power curve, and reports simulated estimates—not field measurements.</p>
        </section>

        <footer className="flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div><Label>Team</Label><p className="mt-2 max-w-2xl text-base leading-7 text-on-surface-variant">Built by Error 404: PushkarManvar and Bella-M07 (backend, optimization, data), Nishant3634 and Mit-Prajapati (frontend).</p></div>
          <p className="text-sm text-secondary">HackOut&apos;26 · Problem 4</p>
        </footer>
      </main>
    </div>
  );
}
