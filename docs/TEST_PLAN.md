# GridMitra Test Plan

## 1 Purpose

This document defines the minimum evidence required to claim that the GridMitra MVP works. Tests must verify calculations, contracts, failure handling and the complete judge-demo workflow.

## 2 Test Levels

| Level | Scope | Primary owner |
|---|---|---|
| Unit | Optimizer, baseline, metrics, validation and explanation rules | Backend and optimizer member |
| Contract | Pydantic schemas, TypeScript types and prepared JSON | Backend and frontend members |
| Integration | API through optimizer and optional persistence | Backend and integration member |
| Frontend | Pages, charts, states and interactions | Frontend member |
| End to end | Complete prepared and stress demo paths | Entire team |

## 3 Shared Tolerance

Use:

```text
EPSILON = 1e-6
```

Floating-point assertions must use tolerance. Values smaller than tolerance may be normalized to zero in serialized output.

## 4 Optimizer Unit Tests

### O01 Normal day

Expected behaviour:

- Solver returns a valid 24-hour result.
- Hourly energy balance holds.
- P1 unserved energy is zero when sufficient supply exists.
- Battery and diesel limits are respected.

### O02 Zero renewable availability

Expected behaviour:

- Solar and wind use remain zero.
- Battery and diesel cover demand within their limits.
- The model returns an emergency plan if available supply is insufficient.

### O03 Renewable surplus with battery capacity

Expected behaviour:

- Current demand is served.
- Battery charges within charge and energy limits.
- Remaining surplus is reported as curtailment.

### O04 Full battery and renewable surplus

Expected behaviour:

- Battery does not exceed maximum energy.
- Excess renewable availability becomes curtailment.

### O05 Evening demand spike

Expected behaviour:

- Optimized plan considers future demand.
- Baseline and optimized plans may use the battery differently.
- P1 remains protected when technically feasible.

### O06 Load-priority shortage

Expected behaviour:

- P4 is reduced before P3 under otherwise equivalent conditions.
- P3 is reduced before P2.
- P2 is reduced before P1.

### O07 P1 versus terminal reserve

Expected behaviour:

- Current P1 demand is served before the terminal reserve target.
- Reserve shortfall is used when both cannot be satisfied.

### O08 Reserve target cannot be met

Expected behaviour:

- Solver returns a valid emergency plan.
- `reserve_shortfall_kwh` is positive.
- The API does not return an avoidable infeasible blank result.

### O09 Completely insufficient supply

Expected behaviour:

- Unserved-load variables make the model solvable.
- Unserved energy is reported for each priority.
- Status is `emergency_plan`.

### O10 No simultaneous battery operation

Expected behaviour for every hour:

```text
not (battery_charge_kwh > EPSILON and battery_discharge_kwh > EPSILON)
```

### O11 Diesel capacity

Expected behaviour:

```text
diesel_generation_kwh
    <= diesel_maximum_kw * interval_hours + EPSILON
```

### O12 Deterministic result

Running the same model version and identical input twice must produce equivalent objective and dispatch results within tolerance.

## 5 Baseline Tests

- Baseline uses renewable energy before battery and diesel.
- Renewable surplus charges the battery before curtailment.
- Battery discharge stops at its hard minimum.
- Baseline does not plan around future demand.
- Diesel never exceeds capacity.
- Shortage reduction follows P4, P3, P2 and P1 order.
- Baseline and optimized models receive identical validated input objects.

## 6 Metric Tests

Test independently:

- Total demand
- Total served and unserved energy
- P1 reliability
- Diesel energy
- Fuel consumption
- Fuel cost
- Diesel-related CO2
- Renewable energy used
- Renewable share
- Curtailment
- Final battery energy
- Reserve shortfall

Include explicit zero-demand tests to prevent division by zero.

## 7 Validation Tests

The API must reject:

- Fewer or more than 24 hourly records
- Duplicate or missing hour indices
- Negative demand
- Negative renewable availability
- Invalid efficiency
- Initial battery energy outside hard bounds
- Minimum battery energy above maximum
- Reserve target above maximum battery energy
- Negative power capacity
- Negative fuel or emission values
- Unsupported scenario enum
- Unsupported interval length

Validation errors must contain stable field paths.

## 8 API Contract Tests

- Health endpoint distinguishes API, solver and database states.
- Demo endpoint returns a valid Optimization Request.
- Validate endpoint accepts the prepared scenario.
- Optimize endpoint returns exactly 24 dispatch rows for a valid solve.
- Response matches the documented schema.
- Emergency plans return calculated data and warnings.
- Solver failure does not return dispatch values as valid.
- Database failure returns the calculated plan with `persistence.saved = false`.
- Unknown saved run returns `404 RUN_NOT_FOUND`.

## 9 Frontend Tests

### Required component and interaction checks

- Load Demo Community calls the correct endpoint.
- Configuration fields display units.
- Invalid inputs display useful messages.
- Run button is disabled during a request.
- Optimal result renders all KPI cards.
- Emergency plan renders both dispatch and warning states.
- P1 and reserve warnings are visually distinct.
- Dispatch chart contains 24 hourly positions.
- Battery chart matches API battery values.
- Scenario changes produce a new request without silently changing the original scenario.
- CSV export contains the current valid run.
- Database failure does not hide the result.
- Solver failure does not replace the previous valid result with empty charts.

## 10 End-to-End Scenarios

### E01 Prepared normal scenario

```text
Load demo → review input → optimize → inspect results → explain an hour → export CSV
```

### E02 Combined stress scenario

```text
Load demo → reduce solar → increase evening demand → degrade battery
→ optimize → display emergency warnings if calculated (now includes P2_REDUCED,
P3_REDUCED and P4_REDUCED whenever load is shed) → explain response
```

### E03 Offline data path

```text
Disable weather access → load prepared data → optimize successfully
```

### E04 Persistence failure

```text
Disable database → optimize → retain results → show save warning → export CSV
```

## 11 Visual and Manual QA

- No clipped cards, tables or chart labels on the presentation laptop.
- Loading, empty, optimal, emergency and failure states are visibly different.
- Every chart includes units and tooltips.
- Colours remain consistent across screens.
- Simulated estimates are labelled.
- No screen implies direct hardware control.
- No hard-coded result is presented as optimizer output.

## 12 Release Gate

Before tagging `v0.1.0-hackout-demo`:

- All optimizer and metric unit tests pass.
- Backend contract tests pass.
- Frontend type check and tests pass.
- Prepared normal and stress scenarios pass end to end.
- A fresh clone starts successfully on a second laptop.
- Offline fallback is rehearsed.
- The team verifies displayed KPI values against the API response.
- Backup screenshots and a short demo recording exist.

