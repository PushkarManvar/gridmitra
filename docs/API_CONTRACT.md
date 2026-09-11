# API Contract

Authoritative HTTP contract for GridMitra. Field names, units, and statuses follow `docs/DATA_CONTRACT.md`. All numeric fields carry explicit units in their names or in the contract below.

## `GET /api/v1/health`

Returns three separate fields. A database failure must not make API health appear completely unavailable.

```json
{
  "api": "ok",
  "solver": "ok",
  "database": "ok"
}
```

- `api`: `ok` when the service is up.
- `solver`: `ok` when CBC can be reached or invoked (checked lazily or on request).
- `database`: `ok` when the database connection is ready, otherwise `unavailable`. This value never downgrades `api`.

## `GET /api/v1/scenarios/demo`

Returns the committed 24-hour scenario. The source file is `data/demo_scenario.json`, served from the repository in development and from the backend image (`/app/data/demo_scenario.json`) in containers.

## `POST /api/v1/optimize`

Accepts a scenario with exactly 24 hourly input records and configuration objects for solar, wind, battery, diesel and operator preferences.

### Request

The request body matches `DATA_CONTRACT.md` §4 exactly:

- `scenario_id`: string.
- `scenario_name`: string (1–100 characters).
- `scenario_type`: one of `normal`, `cloudy`, `demand_spike`, `high_diesel_price`, `battery_degradation`, `combined_stress`, `custom`.
- `site`: `site_id`, `site_name`, `timezone`, `currency`, `start_time`, `interval_hours` (must equal 1 for the MVP).
- `assets`:
  - `solar`: `enabled`, `capacity_kw`.
  - `wind`: `enabled`, `capacity_kw`.
  - `battery`: `capacity_kwh`, `initial_energy_kwh`, `minimum_energy_kwh`, `maximum_energy_kwh`, `maximum_charge_kw`, `maximum_discharge_kw`, `charge_efficiency`, `discharge_efficiency`, `terminal_reserve_target_kwh`, `wear_cost_per_kwh`.
  - `diesel`: `enabled`, `maximum_kw`, `fuel_consumption_l_per_kwh`, `fuel_price_per_l`, `emission_factor_kg_co2_per_l`.
- `operating_policy`: `carbon_price_per_kg_co2` — the only operator-adjustable preference. The P1 penalty, reserve-shortfall penalty, and P2–P4 safety penalties are **backend-controlled** and cannot be changed by the frontend.
- `hours`: exactly 24 records, each with `hour_index` (0–23, unique), `timestamp`, `solar_available_kwh`, `wind_available_kwh`, `p1_demand_kwh`, `p2_demand_kwh`, `p3_demand_kwh`, `p4_demand_kwh`, all non-negative.

Invalid input is rejected with HTTP 422 before any solver runs.

### Response

```json
{
  "run_id": "run_...",
  "status": "optimal | emergency_plan | failed",
  "scenario_id": "demo-normal-001",
  "summary": {},
  "dispatch_hours": [],
  "baseline_summary": {},
  "explanations": [],
  "warnings": [],
  "persistence": {}
}
```

- `status`: normalized solver outcome only. Raw CBC strings are never exposed.
  - `optimal`: solved to optimality with no P1 or terminal-reserve violation.
  - `emergency_plan`: solved, but P1 demand or terminal reserve could not be fully met within physical limits; unmet-load warnings are returned instead of a failure.
  - `failed`: no usable dispatch; the response contains no `dispatch_hours` values.
- `summary` and `baseline_summary`: calculated KPIs per `DATA_CONTRACT.md` §5.2 — `total_demand_kwh`, `total_served_kwh`, `total_unserved_kwh`, `p1_unserved_kwh` through `p4_unserved_kwh`, `diesel_energy_kwh`, `diesel_fuel_l`, `fuel_cost`, `co2_kg`, `renewable_available_kwh`, `renewable_used_kwh`, `renewable_curtailment_kwh`, `renewable_share_percent`, `p1_reliability_percent`, `final_battery_energy_kwh`, `reserve_shortfall_kwh`.
- `dispatch_hours`: array, exactly 24 entries per `DATA_CONTRACT.md` §5.3, with units in every field name.
- `explanations`: deterministic, rule-generated explanations per `DATA_CONTRACT.md` §5.4 (`code`, `severity`, `hour_index`, `message`, `evidence`).
- `warnings`: structured warnings with `code`, `severity`, `message` and optional `hour_index`.
- `persistence`: `{"saved": bool, "message": string | null}`. `saved` is `true` when the run was written to the database; `false` (with `message` = `DATABASE_SAVE_FAILED` and a matching warning) when persistence failed. A database failure never removes the calculated result.

### Warnings

Standardized codes per `DATA_CONTRACT.md` §5.5:

- `P1_UNSERVED` — critical P1 demand could not be fully served.
- `RESERVE_SHORTFALL` — terminal battery reserve target could not be met.
- `RENEWABLE_CURTAILMENT` — available renewable energy was curtailed.
- `DATABASE_SAVE_FAILED` — the result is valid but could not be persisted.
- `FALLBACK_DATA_USED` — simulated data was used in place of live input.

The UI must show a warning whenever `p1_unserved_kwh` or `reserve_shortfall_kwh` is greater than zero.

## `POST /api/v1/optimize/export`

Exports a calculated run as CSV. The request body is the complete `OptimizationResponse` returned by `POST /api/v1/optimize` (with its current `persistence` and `warnings`), so export works entirely from the in-memory result and remains available even when database persistence failed.

Response:

- `Content-Type: text/csv`.
- `Content-Disposition: attachment; filename="{run_id}.csv"`.
- CSV sections:
  - `run` metadata (run_id, status, scenario_id).
  - `dispatch` table: header plus exactly 24 hourly rows with all `DATA_CONTRACT.md` §5.3 fields.
  - `summary` and `baseline_summary` key/value rows for every `§5.2` field.
  - `explanations` rows (code, severity, hour_index, message).
  - `warnings` rows (code, severity, hour_index, message).

## Error responses

### Validation failure — HTTP 422

A consistent error object:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The optimization request is invalid.",
    "fields": [
      {
        "path": "assets.battery.initial_energy_kwh",
        "message": "Initial battery energy must be within configured bounds."
      }
    ]
  }
}
```

Invalid input is rejected before any solver runs.

### Solver failure — HTTP 500 or structured failed result

If the solver cannot produce a usable plan, the API returns a structured `failed` result without `dispatch_hours`, or HTTP 500 with the same error shape. A solver failure must never look like a valid dispatch.

## Implementation status

Implemented:

- `GET /api/v1/health` returns `api`, `solver`, `database`; `database` failures never downgrade `api`.
- `GET /api/v1/scenarios/demo` serves the committed 24-hour scenario.
- `POST /api/v1/optimize` returns the full `DATA_CONTRACT.md` §5 response for valid solves, HTTP 500 on solver failure, and attempts database persistence with `persistence.saved`.
- Consistent 422 error object (`error.code`, `error.message`, `error.fields[]` with stable paths) for validation failures.
- `POST /api/v1/optimize/export` renders the run as CSV from the response body, independent of database state.
- Ordered SQL migrations under `db/migrations/`, applied at backend startup (`gridmitra.schema_migrations` tracks applied files).

Planned (not yet implemented):

- `GET /api/v1/runs` and `GET /api/v1/runs/{id}/export` for persisted run history.