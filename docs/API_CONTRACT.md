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
  "run_id": "<uuid>",
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

- `run_id`: server-generated UUID string. It is also the database primary key of the persisted run and the CSV filename.

- `status`: normalized solver outcome only. Raw CBC strings are never exposed.
  - `optimal`: solved to optimality with no unserved load (P1-P4) and no terminal-reserve violation.
  - `emergency_plan`: solved, but any load (P1-P4) or the terminal reserve could not be fully met within physical limits; unmet-load warnings are returned instead of a failure.
  - `failed`: no usable dispatch; the response contains no `dispatch_hours` values.
- `summary` and `baseline_summary`: calculated KPIs per `DATA_CONTRACT.md` §5.2 — `total_demand_kwh`, `total_served_kwh`, `total_unserved_kwh`, `p1_unserved_kwh` through `p4_unserved_kwh`, `diesel_energy_kwh`, `diesel_fuel_l`, `fuel_cost`, `co2_kg`, `renewable_available_kwh`, `renewable_used_kwh`, `renewable_curtailment_kwh`, `renewable_share_percent`, `p1_reliability_percent`, `final_battery_energy_kwh`, `reserve_shortfall_kwh`.
- `dispatch_hours`: array, exactly 24 entries per `DATA_CONTRACT.md` §5.3, with units in every field name.
- `explanations`: deterministic, rule-generated explanations per `DATA_CONTRACT.md` §5.4 (`code`, `severity`, `hour_index`, `message`, `evidence`).
- `warnings`: structured warnings with `code`, `severity`, `message` and optional `hour_index`.
- `persistence`: `{"saved": bool, "message": string | null}`. `saved` is `true` when the run was written to the database; `false` (with `message` = `DATABASE_SAVE_FAILED` and a matching warning) when persistence failed. A database failure never removes the calculated result.

### Warnings

Standardized codes per `DATA_CONTRACT.md` §5.5:

- `P1_UNSERVED` — critical P1 demand could not be fully served.
- `P4_REDUCED` — flexible P4 demand was shed to protect higher priorities.
- `P3_REDUCED` — P3 demand was shed to protect higher priorities.
- `P2_REDUCED` — P2 demand was shed to protect higher priorities.
- `RESERVE_SHORTFALL` — terminal battery reserve target could not be met.
- `RENEWABLE_CURTAILMENT` — available renewable energy was curtailed.
- `DATABASE_SAVE_FAILED` — the result is valid but could not be persisted.
- `FALLBACK_DATA_USED` — simulated data was used in place of live input.

Any unserved priority (P1-P4) or reserve shortfall makes the status
`emergency_plan`. The UI must render every warning in the `warnings` array and
must always show a warning whenever `p1_unserved_kwh` or `reserve_shortfall_kwh`
is greater than zero.

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

## `GET /api/v1/runs`

Lists persisted optimization runs, newest first.

```json
{
  "runs": [
    {
      "run_id": "string",
      "scenario_id": "string",
      "scenario_name": "string",
      "scenario_type": "string",
      "status": "optimal | emergency_plan | failed",
      "created_at": "ISO 8601",
      "summary": {}
    }
  ]
}
```

`summary` is the full `DATA_CONTRACT.md` §5.2 object for each run.

## `GET /api/v1/runs/{run_id}`

Returns a persisted run: `run_id`, `scenario_id`, `scenario_name`, `scenario_type`, `status`, `created_at`, `summary`, `baseline_summary`, 24 `dispatch_hours`, and `explanations`.

Unknown `run_id` returns HTTP `404` with:

```json
{
  "error": { "code": "RUN_NOT_FOUND", "message": "Run {run_id} not found." }
}
```

## `GET /api/v1/weather/forecast`

Optional live-weather source. FastAPI calls Open-Meteo (no API key for non-commercial use), converts irradiance/wind into 24 hourly solar/wind availability records, and never lets the optimizer call the weather provider directly.

Query parameters:

- `latitude` (−90..90), `longitude` (−180..180) — required.
- `solar_capacity_kw`, `wind_capacity_kw` — required.
- `panel_tilt_degrees` (0..90), `panel_azimuth_degrees` (−180..180) — required (0° = south in Open-Meteo).
- `solar_derating_factor` (0..1, default 0.85) — documented demo assumption.

Response:

```json
{
  "source": "live | cached | prepared_fallback",
  "provider": "open_meteo",
  "timezone": "string | null",
  "hours": [
    {
      "hour_index": 10,
      "timestamp": "2026-09-12T10:00",
      "solar_available_kwh": 40.8,
      "wind_available_kwh": 2.4,
      "cloud_cover_percent": 27
    }
  ],
  "warnings": []
}
```

- `source` `live` = fetched now; `cached` = last successful response for the location; `prepared_fallback` = provider down, no cache.
- Provider failure with no cache returns HTTP `503` `{"error": {"code": "WEATHER_UNAVAILABLE", "message": "Live weather is unavailable. Use prepared data."}}`. A failed weather fetch never fails optimization.
- Demand values are not returned — weather does not provide community P1–P4 demand.

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
- `GET /api/v1/runs` and `GET /api/v1/runs/{run_id}` for persisted run history.
- `GET /api/v1/weather/forecast` for optional live weather (Open-Meteo), with `live`/`cached`/`prepared_fallback` sources and `WEATHER_UNAVAILABLE` on provider failure.

Planned (not yet implemented):

- Nothing in the MVP-critical path. `GET /runs` already covers history reads.