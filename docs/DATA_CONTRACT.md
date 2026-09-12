# GridMitra Data Contract

## 1 Purpose

This document defines the shared data structures used by the React frontend, FastAPI backend, prepared demo data, optimizer and tests. Field names, units and enum values must not be changed in only one component.

## 2 Conventions

- JSON property names use `snake_case`.
- All timestamps use ISO 8601.
- The site timezone is an IANA timezone such as `Asia/Kolkata`.
- The MVP accepts exactly 24 hourly records.
- Energy values use the suffix `_kwh`.
- Power values use the suffix `_kw`.
- Percentages returned by the API use the suffix `_percent` and range from 0 to 100.
- Efficiencies in requests are ratios from greater than 0 through 1.
- Emissions use kilograms of CO2.
- Currency values use the selected site's declared currency.
- Missing optional wind generation is represented by zero capacity and zero hourly availability.

## 3 Enums

### 3.1 Optimization status

```text
optimal
emergency_plan
failed
```

### 3.2 Scenario type

```text
normal
cloudy
demand_spike
high_diesel_price
battery_degradation
combined_stress
custom
```

### 3.3 Message severity

```text
info
warning
critical
```

## 4 Optimization Request

### 4.1 Top-level structure

| Field | Type | Required | Rule |
|---|---|---:|---|
| `scenario_id` | string | Yes | Stable client or database identifier |
| `scenario_name` | string | Yes | 1 to 100 characters |
| `scenario_type` | enum | Yes | One supported scenario type |
| `site` | object | Yes | Site metadata |
| `assets` | object | Yes | Solar, wind, battery and diesel configuration |
| `operating_policy` | object | Yes | Bounded operator preferences |
| `hours` | array | Yes | Exactly 24 ordered hourly records |

### 4.2 Site

| Field | Type | Required | Rule |
|---|---|---:|---|
| `site_id` | string | Yes | Stable identifier |
| `site_name` | string | Yes | 1 to 100 characters |
| `timezone` | string | Yes | Valid IANA timezone |
| `currency` | string | Yes | Three-letter code such as `INR` |
| `start_time` | string | Yes | ISO 8601 timestamp for hour 0 |
| `interval_hours` | number | Yes | Must equal 1 for the MVP |

### 4.3 Solar configuration

| Field | Type | Unit | Rule |
|---|---|---|---|
| `enabled` | boolean | - | Required |
| `capacity_kw` | number | kW | At least 0 |

### 4.4 Wind configuration

| Field | Type | Unit | Rule |
|---|---|---|---|
| `enabled` | boolean | - | Required |
| `capacity_kw` | number | kW | At least 0 |

### 4.5 Battery configuration

| Field | Type | Unit | Rule |
|---|---|---|---|
| `capacity_kwh` | number | kWh | Greater than 0 |
| `initial_energy_kwh` | number | kWh | Within hard bounds |
| `minimum_energy_kwh` | number | kWh | At least 0 |
| `maximum_energy_kwh` | number | kWh | At most capacity |
| `maximum_charge_kw` | number | kW | At least 0 |
| `maximum_discharge_kw` | number | kW | At least 0 |
| `charge_efficiency` | number | ratio | Greater than 0 and at most 1 |
| `discharge_efficiency` | number | ratio | Greater than 0 and at most 1 |
| `terminal_reserve_target_kwh` | number | kWh | From 0 through maximum energy |
| `wear_cost_per_kwh` | number | currency/kWh | At least 0 |

### 4.6 Diesel configuration

| Field | Type | Unit | Rule |
|---|---|---|---|
| `enabled` | boolean | - | Required |
| `maximum_kw` | number | kW | At least 0 |
| `fuel_consumption_l_per_kwh` | number | L/kWh | At least 0 |
| `fuel_price_per_l` | number | currency/L | At least 0 |
| `emission_factor_kg_co2_per_l` | number | kg CO2/L | At least 0 |

### 4.7 Operating policy

| Field | Type | Unit | Rule |
|---|---|---|---|
| `carbon_price_per_kg_co2` | number | currency/kg CO2 | Bounded server-side and at least 0 |

Load-priority and reserve-shortfall penalties are not part of the public request. They are server-controlled constants.

### 4.8 Hourly input

| Field | Type | Unit | Rule |
|---|---|---|---|
| `hour_index` | integer | - | Unique value from 0 through 23 |
| `timestamp` | string | - | ISO 8601 and aligned to site timezone |
| `solar_available_kwh` | number | kWh | At least 0 |
| `wind_available_kwh` | number | kWh | At least 0 |
| `p1_demand_kwh` | number | kWh | At least 0 |
| `p2_demand_kwh` | number | kWh | At least 0 |
| `p3_demand_kwh` | number | kWh | At least 0 |
| `p4_demand_kwh` | number | kWh | At least 0 |

### 4.9 Request example

The example below shows one hourly record. A valid request contains 24 records with the same structure.

```json
{
  "scenario_id": "demo-normal-001",
  "scenario_name": "Normal Day",
  "scenario_type": "normal",
  "site": {
    "site_id": "community-demo-001",
    "site_name": "GridMitra Demo Community",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "start_time": "2026-09-12T00:00:00+05:30",
    "interval_hours": 1
  },
  "assets": {
    "solar": { "enabled": true, "capacity_kw": 60 },
    "wind": { "enabled": true, "capacity_kw": 10 },
    "battery": {
      "capacity_kwh": 120,
      "initial_energy_kwh": 72,
      "minimum_energy_kwh": 24,
      "maximum_energy_kwh": 120,
      "maximum_charge_kw": 30,
      "maximum_discharge_kw": 30,
      "charge_efficiency": 0.95,
      "discharge_efficiency": 0.95,
      "terminal_reserve_target_kwh": 36,
      "wear_cost_per_kwh": 0.5
    },
    "diesel": {
      "enabled": true,
      "maximum_kw": 50,
      "fuel_consumption_l_per_kwh": 0.28,
      "fuel_price_per_l": 90,
      "emission_factor_kg_co2_per_l": 2.68
    }
  },
  "operating_policy": {
    "carbon_price_per_kg_co2": 1
  },
  "hours": [
    {
      "hour_index": 0,
      "timestamp": "2026-09-12T00:00:00+05:30",
      "solar_available_kwh": 0,
      "wind_available_kwh": 3,
      "p1_demand_kwh": 8,
      "p2_demand_kwh": 5,
      "p3_demand_kwh": 7,
      "p4_demand_kwh": 2
    }
  ]
}
```

These values are illustrative contract examples, not measured project results.

## 5 Optimization Response

### 5.1 Top-level structure

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `run_id` | string | Yes | Unique server-generated identifier |
| `status` | enum | Yes | Product-level run status |
| `scenario_id` | string | Yes | Source scenario |
| `summary` | object | Yes for valid solution | Calculated KPIs |
| `dispatch_hours` | array | Yes for valid solution | Exactly 24 result records |
| `baseline_summary` | object | Yes for valid solution | Same KPI structure for baseline |
| `explanations` | array | Yes | Deterministic result explanations |
| `warnings` | array | Yes | May be empty |
| `persistence` | object | Yes | Whether database saving succeeded |

### 5.2 Summary

| Field | Type | Unit |
|---|---|---|
| `total_demand_kwh` | number | kWh |
| `total_served_kwh` | number | kWh |
| `total_unserved_kwh` | number | kWh |
| `p1_unserved_kwh` | number | kWh |
| `p2_unserved_kwh` | number | kWh |
| `p3_unserved_kwh` | number | kWh |
| `p4_unserved_kwh` | number | kWh |
| `diesel_energy_kwh` | number | kWh |
| `diesel_fuel_l` | number | litres |
| `fuel_cost` | number | selected currency |
| `co2_kg` | number | kg CO2 |
| `renewable_available_kwh` | number | kWh |
| `renewable_used_kwh` | number | kWh |
| `renewable_curtailment_kwh` | number | kWh |
| `renewable_share_percent` | number | percent |
| `p1_reliability_percent` | number | percent |
| `final_battery_energy_kwh` | number | kWh |
| `reserve_shortfall_kwh` | number | kWh |

### 5.3 Hourly dispatch result

Each result contains:

```text
hour_index
timestamp
solar_available_kwh
solar_used_kwh
wind_available_kwh
wind_used_kwh
battery_energy_start_kwh
battery_charge_kwh
battery_discharge_kwh
battery_energy_end_kwh
diesel_generation_kwh
p1_demand_kwh through p4_demand_kwh
p1_served_kwh through p4_served_kwh
p1_unserved_kwh through p4_unserved_kwh
renewable_curtailment_kwh
fuel_cost
co2_kg
```

### 5.4 Explanation object

| Field | Type | Rule |
|---|---|---|
| `code` | string | Stable machine-readable code |
| `severity` | enum | `info`, `warning` or `critical` |
| `hour_index` | integer or null | Null for whole-run explanations |
| `message` | string | Plain-language operator explanation |
| `evidence` | object | Numeric values used to form the explanation |

### 5.5 Warning codes

```text
P1_UNSERVED
P2_REDUCED
P3_REDUCED
P4_REDUCED
RESERVE_SHORTFALL
RENEWABLE_CURTAILMENT
DATABASE_SAVE_FAILED
FALLBACK_DATA_USED
```

`P2_REDUCED`, `P3_REDUCED` and `P4_REDUCED` are emitted whenever the optimizer
sheds load of that priority because supply is physically insufficient. Each is a
`warning`. `P1_UNSERVED` remains `critical`.

## 6 Validation Error Contract

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

## 7 Contract Change Rule

Any field addition, removal, rename, unit change or enum change requires all of the following in the same pull request:

1. Update this document.
2. Update FastAPI Pydantic schemas.
3. Update frontend TypeScript types.
4. Update prepared scenario JSON.
5. Update contract and integration tests.
