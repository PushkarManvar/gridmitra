# GridMitra Optimization Model

## 1 Purpose

This document defines the mathematical behaviour of the GridMitra MVP. It is the authoritative reference for the PuLP implementation, optimizer tests, API results and technical explanation presented to judges.

GridMitra produces a reliability-first 24-hour energy dispatch recommendation for one off-grid community. It is a decision-support model, not a hardware controller.

## 2 Model Type and Horizon

| Property | MVP value |
|---|---|
| Model | Mixed-integer linear program |
| Modelling library | PuLP |
| Solver | CBC |
| Horizon | 24 hours |
| Interval length | 1 hour |
| Main energy unit | kWh per interval |
| Power unit | kW |

For a one-hour interval, a constant power of 1 kW corresponds to 1 kWh of energy. The implementation must still retain `interval_hours` in the input contract so units remain explicit.

## 3 Indices

- `t`: hourly interval, from 0 to 23
- `p`: load priority in `P1`, `P2`, `P3`, `P4`

## 4 Input Parameters

### 4.1 Hourly inputs

For every hour `t`:

- `solar_available[t]`: maximum solar energy available
- `wind_available[t]`: maximum wind energy available
- `load[p,t]`: forecast demand for priority `p`

Wind values may be zero when the selected site has no wind generation.

### 4.2 Battery inputs

- `battery_capacity_kwh`
- `initial_energy_kwh`
- `minimum_energy_kwh`
- `maximum_energy_kwh`
- `maximum_charge_kw`
- `maximum_discharge_kw`
- `charge_efficiency`
- `discharge_efficiency`
- `terminal_reserve_target_kwh`
- `battery_wear_cost_per_kwh`

### 4.3 Diesel inputs

- `diesel_maximum_kw`
- `fuel_consumption_l_per_kwh`
- `fuel_price_per_l`
- `emission_factor_kg_co2_per_l`

### 4.4 Operator preference

- `carbon_price_per_kg_co2`

The frontend may adjust the cost-carbon preference through a bounded carbon price. It must not send or modify safety-critical load-priority penalties.

## 5 Decision Variables

For every hour `t`:

- `solar_used[t] >= 0`
- `wind_used[t] >= 0`
- `battery_charge[t] >= 0`
- `battery_discharge[t] >= 0`
- `battery_energy[t] >= 0`
- `diesel_generation[t] >= 0`
- `unserved[p,t] >= 0`
- `battery_charge_mode[t]` is binary

For the complete horizon:

- `reserve_shortfall >= 0`

Renewable curtailment is derived from available energy minus used energy and does not require a separate decision variable.

## 6 Objective Function

The model minimizes the sum of operating cost, carbon cost, battery wear, unserved-load penalties and terminal reserve shortfall.

```text
Minimize:

sum over every hour of
    diesel fuel cost
  + diesel carbon cost
  + battery throughput cost
  + P1 unserved-energy penalty
  + P2 unserved-energy penalty
  + P3 unserved-energy penalty
  + P4 unserved-energy penalty

plus terminal reserve-shortfall penalty
```

Per hour:

```text
fuel_used_l = diesel_generation_kwh * fuel_consumption_l_per_kwh
fuel_cost = fuel_used_l * fuel_price_per_l
carbon_emissions = fuel_used_l * emission_factor_kg_co2_per_l
carbon_cost = carbon_emissions * carbon_price_per_kg_co2
battery_wear = (battery_charge + battery_discharge) * battery_wear_cost_per_kwh
```

### 6.1 Required penalty order

```text
P1 unserved load
    > terminal reserve shortfall
    > P2 unserved load
    > P3 unserved load
    > P4 unserved load
    > normal economic costs
```

P1 must remain more important than the end-of-horizon reserve. Otherwise the optimizer could interrupt a current health-centre load merely to preserve battery energy for later.

Penalty values are backend constants. They must be separated sufficiently that saving all lower-priority cost cannot justify one unit of a higher-priority violation within the configured horizon.

## 7 Constraints

### 7.1 Energy balance

For every hour:

```text
solar_used
+ wind_used
+ diesel_generation
+ battery_discharge
= total_served_load
+ battery_charge
```

Where:

```text
served_load[p,t] = load[p,t] - unserved[p,t]
total_served_load[t] = sum of served_load[p,t] for P1 through P4
```

The implementation must use equality, not greater-than-or-equal, so energy is not created or silently discarded.

### 7.2 Renewable limits

```text
0 <= solar_used[t] <= solar_available[t]
0 <= wind_used[t] <= wind_available[t]
```

Derived curtailment:

```text
renewable_curtailment[t]
    = solar_available[t]
    + wind_available[t]
    - solar_used[t]
    - wind_used[t]
```

### 7.3 Battery transition

```text
battery_energy[t + 1]
    = battery_energy[t]
    + charge_efficiency * battery_charge[t]
    - battery_discharge[t] / discharge_efficiency
```

Initial condition:

```text
battery_energy[0] = initial_energy_kwh
```

Energy limits:

```text
minimum_energy_kwh <= battery_energy[t] <= maximum_energy_kwh
```

Charge and discharge limits:

```text
battery_charge[t]
    <= maximum_charge_kw * interval_hours * battery_charge_mode[t]

battery_discharge[t]
    <= maximum_discharge_kw * interval_hours * (1 - battery_charge_mode[t])
```

These binary constraints prevent simultaneous charging and discharging.

### 7.4 Soft terminal reserve

```text
battery_energy[24] + reserve_shortfall
    >= terminal_reserve_target_kwh

0 <= reserve_shortfall <= terminal_reserve_target_kwh
```

Normally `reserve_shortfall` is zero. Under genuine stress, the system returns an emergency warning instead of failing only because the reserve target could not be met.

### 7.5 Diesel limit

```text
0 <= diesel_generation[t] <= diesel_maximum_kw * interval_hours
```

Generator startup cost, minimum runtime and nonlinear fuel curves are outside the MVP.

### 7.6 Unserved-load limits

```text
0 <= unserved[p,t] <= load[p,t]
```

Unserved-load variables allow the model to return the least-harm emergency plan when total available energy is physically insufficient.

## 8 Reactive No-Lookahead Baseline

The baseline uses the same input data and equipment limits as GridMitra but makes each hourly decision without considering future hours.

For every hour:

1. Use available solar and wind for current demand.
2. Charge the battery with any immediate renewable surplus, within limits.
3. If demand remains, discharge the battery down to its hard minimum.
4. If demand still remains, use diesel up to generator capacity.
5. If supply remains insufficient, reduce P4, then P3, then P2 and finally P1.
6. Continue to the next hour without planning for future demand or the terminal reserve.

The baseline is deterministic. Baseline and optimized results must never be hard-coded.

## 9 Solver Result Mapping

The API exposes product statuses rather than raw CBC status strings.

| Condition | API status |
|---|---|
| Valid solution with no unserved load and no reserve shortfall | `optimal` |
| Valid solution contains any unserved load (P1-P4) or reserve shortfall | `emergency_plan` |
| Solver does not return a valid solution | `failed` |

Any unserved energy in any priority - P1, P2, P3 or P4 - makes the plan an
`emergency_plan`. The least-harm solution sheds the lowest priority first
(P4 -> P3 -> P2 -> P1), and the status must reflect that demand could not be
fully met. Values are compared with the shared tolerance `EPSILON` (section 11);
amounts below `EPSILON` count as zero.

The backend must check solver status before reading decision-variable values. A failed run must not return partial dispatch values as a valid plan.

## 10 Calculated Metrics

```text
total_demand_kwh = sum of all P1-P4 demand
total_served_kwh = total_demand_kwh - total_unserved_kwh
renewable_used_kwh = sum of solar_used and wind_used
diesel_energy_kwh = sum of diesel_generation
fuel_used_l = diesel_energy_kwh * fuel_consumption_l_per_kwh
fuel_cost = fuel_used_l * fuel_price_per_l
co2_kg = fuel_used_l * emission_factor_kg_co2_per_l
renewable_share_percent = renewable_used_kwh / total_served_kwh * 100
p1_reliability_percent = (p1_demand - p1_unserved) / p1_demand * 100
```

If a denominator is zero, the metric service must use an explicitly tested zero-demand rule rather than divide by zero.

## 11 Numerical Tolerance

Use a shared tolerance constant:

```text
EPSILON = 1e-6
```

Values whose absolute magnitude is below `EPSILON` may be normalized to zero in API output. Tests must compare floating-point values using tolerance rather than exact equality.

## 12 Required Validation

Reject the request before solving when:

- The hourly array does not contain exactly 24 records.
- Hour indices are duplicated or missing.
- Demand or renewable availability is negative.
- Efficiency is not greater than zero and at most one.
- Initial battery energy is outside hard bounds.
- Minimum energy exceeds maximum energy.
- Terminal reserve exceeds maximum battery energy.
- Charge, discharge or diesel capacity is negative.
- Fuel consumption, fuel price or emission factor is negative.
- The interval length is not one hour for the MVP.

## 13 Required Model Tests

- Hourly energy balance holds within tolerance.
- Renewable use never exceeds availability.
- Battery energy always remains inside hard bounds.
- Charging and discharging never occur together.
- Diesel output never exceeds capacity.
- P4 is reduced before a higher-priority load when choices are otherwise equivalent.
- P1 is protected before terminal reserve.
- Reserve shortfall is reported when the target cannot be met.
- Zero renewable availability still produces a valid plan when diesel or load shedding is available.
- Completely insufficient supply produces an emergency plan rather than an avoidable infeasible solve.
- Baseline and optimized plans use identical scenario inputs.

## 14 Explicit Non-Goals

The MVP does not model:

- AC power flow
- Voltage or frequency stability
- Generator startup and shutdown dynamics
- Battery temperature or electrochemistry
- Network losses between individual buildings
- Multiple interconnected microgrids
- Automatic hardware actuation
- A trained forecasting model

