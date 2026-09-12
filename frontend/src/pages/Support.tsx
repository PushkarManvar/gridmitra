import { Link } from "react-router-dom";

const FAQ = [
  {
    q: "Is GridMitra machine learning?",
    a: "No. Dispatch is a transparent mixed-integer linear program (PuLP + CBC). Every constraint and objective is visible and explainable.",
  },
  {
    q: "Does it control real equipment?",
    a: "No. It is operator decision support. Physical control would require verified telemetry and additional safety engineering.",
  },
  {
    q: "What if there is not enough energy?",
    a: "The optimizer returns a least-harm emergency plan: P4 → P3 → P2 → P1 reduction order with explicit warnings, and any reserve shortfall is reported.",
  },
  {
    q: "Where does the data come from?",
    a: "A committed representative dataset, with optional live weather from Open-Meteo. All costs, CO2 and reliability figures are calculated by the optimizer from those inputs.",
  },
  {
    q: "Why is wind sometimes zero?",
    a: "The turbine output model returns zero below a 3 m/s cut-in speed and above 25 m/s. The plan shows zero instead of inventing generation.",
  },
];

export function Support() {
  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="max-w-[900px] mx-auto p-8 flex flex-col gap-5">
        <div className="pb-1 border-b border-secondary-fixed">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Support</h1>
          <p className="text-xs text-secondary">Common questions about the GridMitra prototype.</p>
        </div>

        <div className="flex flex-col gap-4">
          {FAQ.map((item) => (
            <section key={item.q} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-bold text-on-surface">{item.q}</h2>
              <p className="mt-1.5 text-sm text-secondary leading-relaxed">{item.a}</p>
            </section>
          ))}
        </div>

        <section className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-xl p-5">
          <h2 className="text-sm font-bold text-primary">Still stuck?</h2>
          <p className="mt-1 text-sm text-secondary leading-relaxed">
            Read the full <Link to="/documentation" className="text-primary font-semibold hover:underline">documentation</Link>,
            or reset to the prepared demo data and re-run the optimization.
          </p>
        </section>
      </main>
    </div>
  );
}