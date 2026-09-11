import { useEffect, useMemo, useState } from "react";

import { DispatchChart } from "./components/DispatchChart";
import { KpiCard } from "./components/KpiCard";
import { SocChart } from "./components/SocChart";
import { getDemoScenario, optimizeScenario } from "./lib/api";
import type { OptimizationResult, Scenario } from "./types";

export default function App() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function runOptimization(nextScenario: Scenario) {
    setLoading(true);
    setError(null);
    try {
      setResult(await optimizeScenario(nextScenario));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDemoScenario()
      .then((data) => {
        setScenario(data);
        return runOptimization(data);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Could not load the demo");
        setLoading(false);
      });
  }, []);

  const reserve = useMemo(
    () => Number(scenario?.battery.reserve_target_kwh ?? 0),
    [scenario]
  );
  const warning = Boolean(
    result &&
      (result.summary.reserve_shortfall_kwh > 0 || result.summary.unserved_critical_kwh > 0)
  );

  return (
    <main className="min-h-screen bg-ink text-emerald-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-mint">
              <span className="h-2 w-2 rounded-full bg-mint" /> Prepared demo
            </div>
            <p className="text-sm text-emerald-100/55">Microgrid decision support</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">GridMitra</h1>
            <p className="mt-3 max-w-2xl text-emerald-50/65">
              A transparent 24-hour dispatch plan for solar, wind, battery, and diesel.
            </p>
          </div>
          <button
            className="rounded-xl bg-mint px-5 py-3 font-semibold text-ink transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60"
            disabled={!scenario || loading}
            onClick={() => scenario && runOptimization(scenario)}
          >
            {loading ? "Optimizing…" : "Run optimization"}
          </button>
        </header>

        {error && (
          <section className="mt-6 rounded-2xl border border-coral/40 bg-coral/10 p-5 text-sm text-red-100">
            <strong>Could not complete the run.</strong> {error}
          </section>
        )}

        {warning && result && (
          <section className="mt-6 rounded-2xl border border-sun/40 bg-sun/10 p-5 text-sm text-amber-50">
            The scenario contains a reliability warning. Review reserve shortfall and critical unmet
            energy before accepting this plan.
          </section>
        )}

        {result && scenario && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Renewable share"
                value={`${result.summary.renewable_share_pct.toFixed(1)}%`}
                detail={`${result.summary.renewable_used_kwh.toFixed(1)} kWh used`}
              />
              <KpiCard
                label="Operating cost"
                value={`$${result.summary.operating_cost.toFixed(2)}`}
                detail="Simulated 24-hour estimate"
                tone="sun"
              />
              <KpiCard
                label="CO2 emissions"
                value={`${result.summary.emissions_kg.toFixed(1)} kg`}
                detail={`${result.summary.diesel_energy_kwh.toFixed(1)} kWh diesel`}
                tone="coral"
              />
              <KpiCard
                label="Reserve shortfall"
                value={`${result.summary.reserve_shortfall_kwh.toFixed(1)} kWh`}
                detail={`Final SOC ${result.summary.final_soc_kwh.toFixed(1)} kWh`}
                tone={result.summary.reserve_shortfall_kwh ? "coral" : "mint"}
              />
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-panel/55 p-4 sm:p-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
                    Hourly plan
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Energy dispatch</h2>
                </div>
                <p className="text-sm text-emerald-100/55">{scenario.name}</p>
              </div>
              <DispatchChart hours={result.hours} />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
              <article className="rounded-3xl border border-white/10 bg-panel/55 p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
                  Battery guardrail
                </p>
                <h2 className="mt-1 text-2xl font-semibold">State of charge</h2>
                <SocChart hours={result.hours} reserve={reserve} />
              </article>

              <article className="rounded-3xl border border-white/10 bg-panel/55 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">
                  Explain this plan
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Optimizer notes</h2>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-emerald-50/70">
                  {result.explanations.map((explanation) => (
                    <li className="flex gap-3" key={explanation}>
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-mint" />
                      {explanation}
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </>
        )}

        <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-emerald-100/45">
          Decision-support prototype · Results are simulated estimates, not field measurements.
        </footer>
      </div>
    </main>
  );
}
