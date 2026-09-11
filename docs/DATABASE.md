# GridMitra Database Design

## 1 Database Policy

- Local development uses PostgreSQL 17 through Docker Compose.
- Hosted deployment uses Supabase PostgreSQL when enabled.
- Local and hosted environments use the same ordered migrations.
- FastAPI is the only application component permitted to use privileged database credentials.
- The optimizer has no database dependency.
- A database failure must not invalidate a plan already calculated in memory.

## 2 Schema

Application tables use the private PostgreSQL schema:

```text
gridmitra
```

If the schema is later exposed through the Supabase Data API, grants and row-level security policies must be added and tested in the same migration. The MVP frontend does not require direct table access.

## 3 Tables

### 3.1 `sites`

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Not null |
| `timezone` | text | Not null |
| `currency` | char(3) | Not null |
| `created_at` | timestamptz | Not null, default now |
| `updated_at` | timestamptz | Not null, default now |

### 3.2 `site_assets`

One active configuration per site is sufficient for the MVP.

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `site_id` | uuid | Foreign key to `sites` |
| `solar_capacity_kw` | numeric | At least 0 |
| `wind_capacity_kw` | numeric | At least 0 |
| `battery_capacity_kwh` | numeric | Greater than 0 |
| `battery_minimum_energy_kwh` | numeric | At least 0 |
| `battery_maximum_energy_kwh` | numeric | At most capacity |
| `battery_maximum_charge_kw` | numeric | At least 0 |
| `battery_maximum_discharge_kw` | numeric | At least 0 |
| `battery_charge_efficiency` | numeric | Greater than 0 and at most 1 |
| `battery_discharge_efficiency` | numeric | Greater than 0 and at most 1 |
| `battery_wear_cost_per_kwh` | numeric | At least 0 |
| `diesel_maximum_kw` | numeric | At least 0 |
| `diesel_fuel_consumption_l_per_kwh` | numeric | At least 0 |
| `diesel_emission_factor_kg_co2_per_l` | numeric | At least 0 |
| `created_at` | timestamptz | Not null, default now |

### 3.3 `scenarios`

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `site_id` | uuid | Foreign key to `sites` |
| `name` | text | Not null |
| `scenario_type` | text | Checked enum value |
| `start_time` | timestamptz | Not null |
| `interval_hours` | numeric | Must equal 1 for MVP |
| `initial_battery_energy_kwh` | numeric | Not null |
| `terminal_reserve_target_kwh` | numeric | At least 0 |
| `fuel_price_per_l` | numeric | At least 0 |
| `carbon_price_per_kg_co2` | numeric | At least 0 |
| `source` | text | `prepared`, `manual` or `weather_api` |
| `created_at` | timestamptz | Not null, default now |

### 3.4 `scenario_hours`

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `scenario_id` | uuid | Foreign key to `scenarios` with cascade delete |
| `hour_index` | smallint | From 0 through 23 |
| `timestamp` | timestamptz | Not null |
| `solar_available_kwh` | numeric | At least 0 |
| `wind_available_kwh` | numeric | At least 0 |
| `p1_demand_kwh` | numeric | At least 0 |
| `p2_demand_kwh` | numeric | At least 0 |
| `p3_demand_kwh` | numeric | At least 0 |
| `p4_demand_kwh` | numeric | At least 0 |

Required unique constraint:

```text
unique (scenario_id, hour_index)
```

### 3.5 `optimization_runs`

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `scenario_id` | uuid | Foreign key to `scenarios` |
| `status` | text | `optimal`, `emergency_plan` or `failed` |
| `solver_name` | text | Not null |
| `solver_status` | text | Raw status for diagnostics |
| `model_version` | text | Not null |
| `input_snapshot` | jsonb | Complete validated request |
| `summary` | jsonb | Calculated KPI object |
| `baseline_summary` | jsonb | Calculated baseline KPI object |
| `persistence_warning` | text | Nullable |
| `created_at` | timestamptz | Not null, default now |

The input snapshot preserves reproducibility even if the site configuration changes later.

### 3.6 `dispatch_hours`

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `run_id` | uuid | Foreign key to `optimization_runs` with cascade delete |
| `hour_index` | smallint | From 0 through 23 |
| `timestamp` | timestamptz | Not null |
| `result` | jsonb | Hourly result matching `DATA_CONTRACT.md` |

Required unique constraint:

```text
unique (run_id, hour_index)
```

The MVP uses a validated JSONB result to avoid a very wide table. Frequently queried summary fields remain in `optimization_runs.summary`.

### 3.7 `decision_explanations`

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | Primary key |
| `run_id` | uuid | Foreign key to `optimization_runs` with cascade delete |
| `hour_index` | smallint | Nullable; 0 through 23 when present |
| `code` | text | Not null |
| `severity` | text | `info`, `warning` or `critical` |
| `message` | text | Not null |
| `evidence` | jsonb | Numeric evidence used by the rule |
| `created_at` | timestamptz | Not null, default now |

## 4 Relationships

```text
sites
├── site_assets
└── scenarios
    ├── scenario_hours
    └── optimization_runs
        ├── dispatch_hours
        └── decision_explanations
```

## 5 Indexes

Create indexes for:

- `scenarios(site_id, created_at desc)`
- `scenario_hours(scenario_id, hour_index)`
- `optimization_runs(scenario_id, created_at desc)`
- `dispatch_hours(run_id, hour_index)`
- `decision_explanations(run_id, hour_index)`

Do not add speculative indexes without a demonstrated query.

## 6 Persistence Workflow

1. Validate the request.
2. Calculate baseline and optimized plans in memory.
3. Build the full API response.
4. Attempt to save the site, scenario, run, hourly output and explanations in one transaction.
5. If saving succeeds, return `persistence.saved = true`.
6. If saving fails, log the failure and return the calculated result with `persistence.saved = false` and `DATABASE_SAVE_FAILED`.

## 7 Migration Rules

- Never edit a migration already applied to a shared environment.
- Add a new ordered migration for every schema change.
- Keep seed data separate from structural migrations where practical.
- Use explicit constraints for non-negative quantities and supported enum values.
- Test migrations against a fresh local database before applying them to hosted Supabase.

## 8 Security

- Keep database URLs and service credentials outside source control.
- Never place a service-role key or database password in a `VITE_` variable.
- Use a dedicated application database role where possible.
- Parameterize database queries.
- Store no personal or medical information in the MVP.
- If browser access is added, enable RLS before exposing tables.

## 9 Data Retention

The hackathon MVP may keep prepared scenarios and successful demo runs. Failed diagnostic runs may be deleted after debugging. Production retention policy is outside the MVP.

