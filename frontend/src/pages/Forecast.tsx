import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RenewableForecastChart } from "../charts/RenewableForecastChart";
import { DemandPriorityChart } from "../charts/DemandPriorityChart";
import { CloudCoverChart } from "../charts/CloudCoverChart";
import { useApp } from "../context/AppContext";
import { fetchWeatherForecast } from "../services/weatherApi";
import type { Scenario } from "../types/index";
import type { WeatherForecast } from "../types/weather";

function applyWeatherToScenario(scenario: Scenario, weather: WeatherForecast): Scenario {
  const next: Scenario = JSON.parse(JSON.stringify(scenario));
  next.scenario_name = `Live weather (${weather.source})`;
  next.scenario_type = "custom";
  const byHour = new Map(weather.hours.map((hour) => [hour.hour_index, hour]));
  for (const hour of next.hours) {
    const live = byHour.get(hour.hour_index);
    if (live) {
      hour.solar_available_kwh = live.solar_available_kwh;
      hour.wind_available_kwh = live.wind_available_kwh;
    }
  }
  return next;
}

const SOURCE_BADGE: Record<WeatherForecast["source"], { label: string; className: string }> = {
  live: { label: "LIVE WEATHER", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  cached: { label: "CACHED FORECAST", className: "bg-sky-100 text-sky-800 border-sky-300" },
  prepared_fallback: { label: "PREPARED FALLBACK", className: "bg-amber-100 text-amber-800 border-amber-300" },
};

export function Forecast() {
  const navigate = useNavigate();
  const { scenario, error, reset, run } = useApp();
  const [lat, setLat] = useState<string>(String(scenario?.site.latitude ?? 23.0225));
  const [lon, setLon] = useState<string>(String(scenario?.site.longitude ?? 72.5714));
  const [tilt, setTilt] = useState<string>(String(scenario?.site.panel_tilt_degrees ?? 23));
  const [azimuth, setAzimuth] = useState<string>(String(scenario?.site.panel_azimuth_degrees ?? 0));
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">{error ?? "Loading…"}</p>
      </div>
    );
  }

  const displayedHours = weather?.hours ?? [];

  const handleFetch = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const forecast = await fetchWeatherForecast({
        latitude: Number(lat),
        longitude: Number(lon),
        solar_capacity_kw: scenario.assets.solar.capacity_kw,
        wind_capacity_kw: scenario.assets.wind.capacity_kw,
        panel_tilt_degrees: Number(tilt),
        panel_azimuth_degrees: Number(azimuth),
        solar_derating_factor: scenario.site.solar_derating_factor ?? 0.85,
        date: scenario.site.start_time.slice(0, 10),
        timezone: scenario.site.timezone || "Asia/Kolkata",
      });
      setWeather(forecast);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (caught) {
      setWeatherError(
        "Live weather is unavailable. Falling back to prepared data.",
      );
      setWeather({
        source: "prepared_fallback",
        provider: "open_meteo",
        timezone: scenario.site.timezone,
        hours: [],
        warnings: [
          {
            code: "FALLBACK_DATA_USED",
            severity: "warning",
            message: "Live weather was unavailable, so prepared forecast data is being used.",
          },
        ],
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleRunWithWeather = async () => {
    if (!weather || weather.hours.length === 0) return;
    setRunning(true);
    const nextScenario = applyWeatherToScenario(scenario, weather);
    const nextResult = await run(nextScenario);
    setRunning(false);
    if (nextResult) navigate("/dispatch");
  };

  const badge = weather ? SOURCE_BADGE[weather.source] : null;

  const locationInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    unit: string,
  ) => (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-mono text-secondary uppercase text-[10px] font-semibold">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-24 px-2 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary"
        />
        <span className="text-secondary">{unit}</span>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="pb-28 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1600px] mx-auto p-8 flex flex-col gap-6">
          <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-outline-variant">
            <div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">Forecast &amp; Demand</h1>
              <p className="text-sm text-secondary mt-1">
                Review the next 24 hours of renewable availability. Live weather (Open-Meteo) is optional; prepared data is the default.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {badge && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${badge.className}`}>
                  {badge.label}
                </span>
              )}
              {lastUpdated && (
                <span className="text-[10px] font-mono text-secondary">Updated {lastUpdated}</span>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-fixed border border-outline-variant text-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">database</span>
                <span className="font-medium text-on-surface">{scenario.scenario_name}</span>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">Live weather source</h2>
              <span className="text-[10px] font-mono text-secondary">Open-Meteo · no API key required</span>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              {locationInput("Latitude", lat, setLat, "°")}
              {locationInput("Longitude", lon, setLon, "°")}
              {locationInput("Panel tilt", tilt, setTilt, "°")}
              {locationInput("Panel azimuth", azimuth, setAzimuth, "°")}
              <button
                onClick={() => void handleFetch()}
                disabled={weatherLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">cloud</span>
                <span>{weatherLoading ? "Fetching…" : "Fetch Live Weather"}</span>
              </button>
              <button
                onClick={() => {
                  setWeather(null);
                  setLastUpdated(null);
                  void reset();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Use Prepared Data</span>
              </button>
              {weather && weather.hours.length > 0 && (
                <button
                  onClick={() => void handleRunWithWeather()}
                  disabled={running}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary text-xs font-semibold rounded-lg hover:bg-primary transition-colors disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>{running ? "Optimizing…" : "Run Optimization with Live Weather"}</span>
                </button>
              )}
            </div>
            {weatherError && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-2.5">
                {weatherError}
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-bold text-on-surface mb-2">
                Renewable availability {weather ? "(live)" : "(prepared)"}
              </h2>
              <RenewableForecastChart
                hours={
                  weather && weather.hours.length > 0
                    ? weather.hours.map((h) => ({
                        hour_index: h.hour_index,
                        timestamp: h.timestamp,
                        solar_available_kwh: h.solar_available_kwh,
                        wind_available_kwh: h.wind_available_kwh,
                        p1_demand_kwh: 0,
                        p2_demand_kwh: 0,
                        p3_demand_kwh: 0,
                        p4_demand_kwh: 0,
                      }))
                    : scenario.hours
                }
              />
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-bold text-on-surface mb-2">Demand by priority (P1–P4)</h2>
              <DemandPriorityChart hours={scenario.hours} />
            </div>
          </section>

          {displayedHours.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-bold text-on-surface mb-2">Cloud cover forecast</h2>
              <CloudCoverChart hours={displayedHours} />
            </section>
          )}

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">Hourly forecast table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-secondary text-left border-b border-outline-variant">
                    <th className="py-1.5 pr-2">Hour</th>
                    <th className="py-1.5 pr-2">Solar (kWh)</th>
                    <th className="py-1.5 pr-2">Wind (kWh)</th>
                    <th className="py-1.5 pr-2">P1</th>
                    <th className="py-1.5 pr-2">P2</th>
                    <th className="py-1.5 pr-2">P3</th>
                    <th className="py-1.5">P4</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.hours.map((hour) => {
                    const live = weather?.hours.find((w) => w.hour_index === hour.hour_index);
                    return (
                      <tr key={hour.hour_index} className="border-b border-outline-variant/40">
                        <td className="py-1.5 pr-2 text-on-surface font-semibold">{hour.hour_index}:00</td>
                        <td className="py-1.5 pr-2">{live ? live.solar_available_kwh : hour.solar_available_kwh}</td>
                        <td className="py-1.5 pr-2">{live ? live.wind_available_kwh : hour.wind_available_kwh}</td>
                        <td className="py-1.5 pr-2">{hour.p1_demand_kwh.toFixed(1)}</td>
                        <td className="py-1.5 pr-2">{hour.p2_demand_kwh.toFixed(1)}</td>
                        <td className="py-1.5 pr-2">{hour.p3_demand_kwh.toFixed(1)}</td>
                        <td className="py-1.5">{hour.p4_demand_kwh.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}