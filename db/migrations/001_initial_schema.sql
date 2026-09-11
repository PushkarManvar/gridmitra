create schema if not exists gridmitra;

create table if not exists gridmitra.sites (
    id uuid primary key,
    name text not null,
    timezone text not null,
    currency char(3) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists gridmitra.site_assets (
    id uuid primary key,
    site_id uuid not null references gridmitra.sites(id) on delete cascade,
    solar_capacity_kw numeric not null check (solar_capacity_kw >= 0),
    wind_capacity_kw numeric not null check (wind_capacity_kw >= 0),
    battery_capacity_kwh numeric not null check (battery_capacity_kwh > 0),
    battery_minimum_energy_kwh numeric not null check (battery_minimum_energy_kwh >= 0),
    battery_maximum_energy_kwh numeric not null check (
        battery_maximum_energy_kwh >= 0 and battery_maximum_energy_kwh <= battery_capacity_kwh
    ),
    battery_maximum_charge_kw numeric not null check (battery_maximum_charge_kw >= 0),
    battery_maximum_discharge_kw numeric not null check (battery_maximum_discharge_kw >= 0),
    battery_charge_efficiency numeric not null check (
        battery_charge_efficiency > 0 and battery_charge_efficiency <= 1
    ),
    battery_discharge_efficiency numeric not null check (
        battery_discharge_efficiency > 0 and battery_discharge_efficiency <= 1
    ),
    battery_wear_cost_per_kwh numeric not null check (battery_wear_cost_per_kwh >= 0),
    diesel_maximum_kw numeric not null check (diesel_maximum_kw >= 0),
    diesel_fuel_consumption_l_per_kwh numeric not null check (diesel_fuel_consumption_l_per_kwh >= 0),
    diesel_emission_factor_kg_co2_per_l numeric not null check (
        diesel_emission_factor_kg_co2_per_l >= 0
    ),
    created_at timestamptz not null default now()
);

create table if not exists gridmitra.scenarios (
    id uuid primary key,
    site_id uuid not null references gridmitra.sites(id) on delete cascade,
    name text not null,
    scenario_type text not null check (
        scenario_type in ('normal', 'cloudy', 'demand_spike', 'high_diesel_price', 'battery_degradation', 'combined_stress', 'custom')
    ),
    start_time timestamptz not null,
    interval_hours numeric not null check (interval_hours = 1),
    initial_battery_energy_kwh numeric not null check (initial_battery_energy_kwh >= 0),
    terminal_reserve_target_kwh numeric not null check (terminal_reserve_target_kwh >= 0),
    fuel_price_per_l numeric not null check (fuel_price_per_l >= 0),
    carbon_price_per_kg_co2 numeric not null check (carbon_price_per_kg_co2 >= 0),
    source text not null check (source in ('prepared', 'manual', 'weather_api')),
    created_at timestamptz not null default now()
);

create table if not exists gridmitra.scenario_hours (
    id uuid primary key,
    scenario_id uuid not null references gridmitra.scenarios(id) on delete cascade,
    hour_index smallint not null check (hour_index >= 0 and hour_index <= 23),
    timestamp timestamptz not null,
    solar_available_kwh numeric not null check (solar_available_kwh >= 0),
    wind_available_kwh numeric not null check (wind_available_kwh >= 0),
    p1_demand_kwh numeric not null check (p1_demand_kwh >= 0),
    p2_demand_kwh numeric not null check (p2_demand_kwh >= 0),
    p3_demand_kwh numeric not null check (p3_demand_kwh >= 0),
    p4_demand_kwh numeric not null check (p4_demand_kwh >= 0),
    unique (scenario_id, hour_index)
);

create table if not exists gridmitra.optimization_runs (
    id uuid primary key,
    scenario_id uuid references gridmitra.scenarios(id) on delete set null,
    status text not null check (status in ('optimal', 'emergency_plan', 'failed')),
    solver_name text not null,
    solver_status text not null,
    model_version text not null,
    input_snapshot jsonb not null,
    summary jsonb not null,
    baseline_summary jsonb not null,
    persistence_warning text,
    created_at timestamptz not null default now()
);

create table if not exists gridmitra.dispatch_hours (
    id uuid primary key,
    run_id uuid not null references gridmitra.optimization_runs(id) on delete cascade,
    hour_index smallint not null check (hour_index >= 0 and hour_index <= 23),
    timestamp timestamptz not null,
    result jsonb not null,
    unique (run_id, hour_index)
);

create table if not exists gridmitra.decision_explanations (
    id uuid primary key,
    run_id uuid not null references gridmitra.optimization_runs(id) on delete cascade,
    hour_index smallint check (hour_index is null or (hour_index >= 0 and hour_index <= 23)),
    code text not null,
    severity text not null check (severity in ('info', 'warning', 'critical')),
    message text not null,
    evidence jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_scenarios_site_created_at on gridmitra.scenarios (site_id, created_at desc);
create index if not exists idx_scenario_hours_scenario on gridmitra.scenario_hours (scenario_id, hour_index);
create index if not exists idx_runs_scenario_created_at on gridmitra.optimization_runs (scenario_id, created_at desc);
create index if not exists idx_dispatch_run_hour on gridmitra.dispatch_hours (run_id, hour_index);
create index if not exists idx_explanations_run_hour on gridmitra.decision_explanations (run_id, hour_index);

comment on schema gridmitra is
    'Private application schema. Do not expose through the Supabase Data API without explicit grants and RLS.';