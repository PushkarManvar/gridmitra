import { useApp } from "../context/AppContext";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/40 text-xs">
      <span className="text-secondary">{label}</span>
      <span className="font-mono text-on-surface font-medium">{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
      <h2 className="text-sm font-bold text-on-surface mb-3">{title}</h2>
      {children}
    </div>
  );
}

export function Configuration() {
  const { scenario, error } = useApp();

  if (!scenario) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">{error ?? "Loading…"}</p>
      </div>
    );
  }

  const { assets, site } = scenario;
  const currency = currencySymbol(site.currency);
  const b = assets.battery;
  const d = assets.diesel;

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="pb-14 w-full flex-1">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant pb-5">
            <div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">Microgrid Configuration</h1>
              <p className="text-sm text-secondary mt-1">
                {site.site_name} · {site.timezone} · {site.currency}
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface">
                <span className="text-secondary">Preset:</span>
                <span className="font-semibold">{scenario.scenario_name}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Solar & Wind">
              <Row label="Solar enabled" value={assets.solar.enabled ? "Yes" : "No"} />
              <Row label="Solar capacity" value={`${assets.solar.capacity_kw} kW`} />
              <Row label="Wind enabled" value={assets.wind.enabled ? "Yes" : "No"} />
              <Row label="Wind capacity" value={`${assets.wind.capacity_kw} kW`} />
            </Card>

            <Card title="Battery">
              <Row label="Capacity" value={`${b.capacity_kwh} kWh`} />
              <Row label="Initial energy" value={`${b.initial_energy_kwh} kWh`} />
              <Row label="Min / max energy" value={`${b.minimum_energy_kwh} / ${b.maximum_energy_kwh} kWh`} />
              <Row label="Max charge / discharge" value={`${b.maximum_charge_kw} / ${b.maximum_discharge_kw} kW`} />
              <Row label="Charge / discharge efficiency" value={`${(b.charge_efficiency * 100).toFixed(0)}% / ${(b.discharge_efficiency * 100).toFixed(0)}%`} />
              <Row label="Terminal reserve target" value={`${b.terminal_reserve_target_kwh} kWh`} />
              <Row label="Wear cost" value={`${currency}${b.wear_cost_per_kwh}/kWh`} />
            </Card>

            <Card title="Diesel Generator">
              <Row label="Enabled" value={d.enabled ? "Yes" : "No"} />
              <Row label="Maximum output" value={`${d.maximum_kw} kW`} />
              <Row label="Fuel consumption" value={`${d.fuel_consumption_l_per_kwh} L/kWh`} />
              <Row label="Fuel price" value={`${currency}${d.fuel_price_per_l}/L`} />
              <Row label="Emission factor" value={`${d.emission_factor_kg_co2_per_l} kg CO2/L`} />
            </Card>

            <Card title="Operating Preference">
              <Row label="Carbon price" value={`${currency}${scenario.operating_policy.carbon_price_per_kg_co2}/kg CO2`} />
              <Row label="Load priorities" value="P1 > Reserve > P2 > P3 > P4" />
              <p className="mt-3 text-[10px] font-mono text-secondary">
                Safety penalties are backend-controlled and not exposed to the frontend.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}