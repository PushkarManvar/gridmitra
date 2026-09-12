import { useApp } from "../context/AppContext";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-label-uppercase text-secondary">{label}</span>
      <span className="font-metric-mono-md text-on-surface">{value}</span>
    </div>
  );
}

function AssetCard({
  title,
  icon,
  accentClass,
  children,
}: {
  title: string;
  icon: string;
  accentClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <div className={`h-1 w-full ${accentClass}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClass} bg-surface-container-low`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </span>
            <h2 className="font-headline-sm text-on-surface">{title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">{children}</div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
      <p className="font-label-uppercase text-secondary mb-1">{label}</p>
      <p className="font-metric-mono-lg text-on-surface">{value}</p>
      <p className="font-body-sm text-secondary mt-1">{detail}</p>
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

  const { assets, site, operating_policy } = scenario;
  const currency = currencySymbol(site.currency);
  const b = assets.battery;
  const d = assets.diesel;
  const renewableCapacity =
    (assets.solar.enabled ? assets.solar.capacity_kw : 0) +
    (assets.wind.enabled ? assets.wind.capacity_kw : 0);

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="pb-14 w-full flex-1">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          <header className="border-b border-outline-variant pb-5">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Microgrid Configuration</h1>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Renewable capacity"
              value={`${renewableCapacity} kW`}
              detail={`${assets.solar.enabled ? `${assets.solar.capacity_kw} kW solar` : "Solar off"} · ${
                assets.wind.enabled ? `${assets.wind.capacity_kw} kW wind` : "Wind off"
              }`}
            />
            <SummaryCard
              label="Battery storage"
              value={`${b.capacity_kwh} kWh`}
              detail={`Reserve target ${b.terminal_reserve_target_kwh} kWh`}
            />
            <SummaryCard
              label="Diesel backup"
              value={d.enabled ? `${d.maximum_kw} kW` : "Off"}
              detail={d.enabled ? `${d.fuel_consumption_l_per_kwh} L/kWh` : "No backup generation"}
            />
            <SummaryCard
              label="Load priority"
              value="P1 → P4"
              detail="P1 > Reserve > P2 > P3 > P4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AssetCard
              title="Solar & Wind"
              icon="solar_power"
              accentClass="bg-[#D97706]"
            >
              <ValueRow label="Solar" value={assets.solar.enabled ? `${assets.solar.capacity_kw} kW` : "Disabled"} />
              <ValueRow label="Wind" value={assets.wind.enabled ? `${assets.wind.capacity_kw} kW` : "Disabled"} />
            </AssetCard>

            <AssetCard
              title="Battery"
              icon="battery_charging_full"
              accentClass="bg-[#2563EB]"
            >
              <ValueRow label="Capacity" value={`${b.capacity_kwh} kWh`} />
              <ValueRow label="Initial energy" value={`${b.initial_energy_kwh} kWh`} />
              <ValueRow label="Min / max energy" value={`${b.minimum_energy_kwh} / ${b.maximum_energy_kwh} kWh`} />
              <ValueRow label="Charge / discharge" value={`${b.maximum_charge_kw} / ${b.maximum_discharge_kw} kW`} />
              <ValueRow label="Efficiency (in / out)" value={`${(b.charge_efficiency * 100).toFixed(0)}% / ${(b.discharge_efficiency * 100).toFixed(0)}%`} />
              <ValueRow label="Terminal reserve target" value={`${b.terminal_reserve_target_kwh} kWh`} />
              <ValueRow label="Wear cost" value={`${currency}${b.wear_cost_per_kwh}/kWh`} />
            </AssetCard>

            <AssetCard
              title="Diesel Generator"
              icon="local_gas_station"
              accentClass="bg-[#EA580C]"
            >
              <ValueRow label="Maximum output" value={`${d.maximum_kw} kW`} />
              <ValueRow label="Fuel consumption" value={`${d.fuel_consumption_l_per_kwh} L/kWh`} />
              <ValueRow label="Fuel price" value={`${currency}${d.fuel_price_per_l}/L`} />
              <ValueRow label="Emission factor" value={`${d.emission_factor_kg_co2_per_l} kg CO2/L`} />
            </AssetCard>

            <AssetCard
              title="Operating Preference"
              icon="tune"
              accentClass="bg-primary"
            >
              <ValueRow label="Carbon price" value={`${currency}${operating_policy.carbon_price_per_kg_co2}/kg CO2`} />
              <ValueRow label="Load priorities" value="P1 > Reserve > P2 > P3 > P4" />
              <div className="col-span-2">
                <p className="mt-3 text-code-mono-sm text-secondary">
                  Safety penalties are backend-controlled and not exposed to the frontend.
                </p>
              </div>
            </AssetCard>
          </div>
        </div>
      </main>
    </div>
  );
}
