from dataclasses import dataclass

import pulp

from app.models import (
    HourDispatch,
    OptimizationRequest,
    OptimizationResponse,
    OptimizationSummary,
)


class OptimizationError(RuntimeError):
    pass


@dataclass(frozen=True)
class Variables:
    solar: dict[int, pulp.LpVariable]
    wind: dict[int, pulp.LpVariable]
    diesel: dict[int, pulp.LpVariable]
    charge: dict[int, pulp.LpVariable]
    discharge: dict[int, pulp.LpVariable]
    soc: dict[int, pulp.LpVariable]
    unserved_critical: dict[int, pulp.LpVariable]
    unserved_flexible: dict[int, pulp.LpVariable]
    charge_mode: dict[int, pulp.LpVariable]
    reserve_shortfall: pulp.LpVariable


def _value(variable: pulp.LpVariable) -> float:
    value = pulp.value(variable)
    return round(float(value or 0), 6)


def optimize_microgrid(request: OptimizationRequest) -> OptimizationResponse:
    hours = sorted(request.hours, key=lambda item: item.hour)
    indices = range(24)
    battery = request.battery
    diesel_config = request.diesel
    weights = request.objective

    model = pulp.LpProblem("gridmitra_dispatch", pulp.LpMinimize)
    variables = Variables(
        solar=pulp.LpVariable.dicts("solar", indices, lowBound=0),
        wind=pulp.LpVariable.dicts("wind", indices, lowBound=0),
        diesel=pulp.LpVariable.dicts("diesel", indices, lowBound=0),
        charge=pulp.LpVariable.dicts("charge", indices, lowBound=0),
        discharge=pulp.LpVariable.dicts("discharge", indices, lowBound=0),
        soc=pulp.LpVariable.dicts(
            "soc",
            indices,
            lowBound=battery.min_soc_kwh,
            upBound=battery.max_soc_kwh,
        ),
        unserved_critical=pulp.LpVariable.dicts("unserved_critical", indices, lowBound=0),
        unserved_flexible=pulp.LpVariable.dicts("unserved_flexible", indices, lowBound=0),
        charge_mode=pulp.LpVariable.dicts("charge_mode", indices, cat="Binary"),
        reserve_shortfall=pulp.LpVariable("reserve_shortfall", lowBound=0),
    )

    for index, hour in enumerate(hours):
        model += variables.solar[index] <= hour.solar_available_kwh
        model += variables.wind[index] <= hour.wind_available_kwh
        model += variables.diesel[index] <= diesel_config.max_power_kw
        model += variables.charge[index] <= battery.max_charge_kw * variables.charge_mode[index]
        model += variables.discharge[index] <= battery.max_discharge_kw * (
            1 - variables.charge_mode[index]
        )
        model += variables.unserved_critical[index] <= hour.critical_load_kwh
        model += variables.unserved_flexible[index] <= hour.flexible_load_kwh

        model += (
            variables.solar[index]
            + variables.wind[index]
            + variables.diesel[index]
            + variables.discharge[index]
            + variables.unserved_critical[index]
            + variables.unserved_flexible[index]
            == hour.critical_load_kwh + hour.flexible_load_kwh + variables.charge[index]
        )

        previous_soc = battery.initial_soc_kwh if index == 0 else variables.soc[index - 1]
        model += variables.soc[index] == (
            previous_soc
            + battery.charge_efficiency * variables.charge[index]
            - variables.discharge[index] * (1 / battery.discharge_efficiency)
        )

    # Soft terminal reserve: difficult scenarios remain solvable and the shortfall is explicit.
    model += variables.soc[23] + variables.reserve_shortfall >= battery.reserve_target_kwh

    diesel_unit_cost = (
        diesel_config.cost_per_kwh
        + weights.carbon_price_per_kg * diesel_config.emission_kg_per_kwh
    )
    model += (
        pulp.lpSum(variables.diesel[i] * diesel_unit_cost for i in indices)
        + pulp.lpSum(
            (variables.charge[i] + variables.discharge[i])
            * battery.throughput_cost_per_kwh
            for i in indices
        )
        + pulp.lpSum(
            variables.unserved_critical[i] * weights.critical_unserved_penalty_per_kwh
            for i in indices
        )
        + pulp.lpSum(
            variables.unserved_flexible[i] * weights.flexible_unserved_penalty_per_kwh
            for i in indices
        )
        + variables.reserve_shortfall * weights.reserve_shortfall_penalty_per_kwh
    )

    status_code = model.solve(pulp.PULP_CBC_CMD(msg=False))
    status_name = pulp.LpStatus[status_code]
    if status_name not in {"Optimal", "Feasible"}:
        raise OptimizationError(f"Solver returned {status_name}")

    dispatch = [
        HourDispatch(
            hour=hour.hour,
            solar_kwh=_value(variables.solar[index]),
            wind_kwh=_value(variables.wind[index]),
            diesel_kwh=_value(variables.diesel[index]),
            battery_charge_kwh=_value(variables.charge[index]),
            battery_discharge_kwh=_value(variables.discharge[index]),
            battery_soc_kwh=_value(variables.soc[index]),
            unserved_critical_kwh=_value(variables.unserved_critical[index]),
            unserved_flexible_kwh=_value(variables.unserved_flexible[index]),
        )
        for index, hour in enumerate(hours)
    ]

    diesel_energy = sum(item.diesel_kwh for item in dispatch)
    renewable_used = sum(item.solar_kwh + item.wind_kwh for item in dispatch)
    served_energy = sum(
        hour.critical_load_kwh
        + hour.flexible_load_kwh
        - item.unserved_critical_kwh
        - item.unserved_flexible_kwh
        for hour, item in zip(hours, dispatch, strict=True)
    )
    operating_cost = (
        diesel_energy * diesel_config.cost_per_kwh
        + sum(
            (item.battery_charge_kwh + item.battery_discharge_kwh)
            * battery.throughput_cost_per_kwh
            for item in dispatch
        )
    )
    reserve_shortfall = _value(variables.reserve_shortfall)
    unserved_critical = sum(item.unserved_critical_kwh for item in dispatch)
    unserved_flexible = sum(item.unserved_flexible_kwh for item in dispatch)

    summary = OptimizationSummary(
        operating_cost=round(operating_cost, 2),
        emissions_kg=round(diesel_energy * diesel_config.emission_kg_per_kwh, 2),
        diesel_energy_kwh=round(diesel_energy, 2),
        renewable_used_kwh=round(renewable_used, 2),
        renewable_share_pct=round(100 * renewable_used / served_energy, 1)
        if served_energy
        else 0,
        unserved_critical_kwh=round(unserved_critical, 3),
        unserved_flexible_kwh=round(unserved_flexible, 3),
        reserve_shortfall_kwh=reserve_shortfall,
        final_soc_kwh=dispatch[-1].battery_soc_kwh,
    )

    explanations = _build_explanations(summary, request)
    return OptimizationResponse(
        status="optimal" if status_name == "Optimal" else "feasible",
        hours=dispatch,
        summary=summary,
        explanations=explanations,
    )


def _build_explanations(
    summary: OptimizationSummary, request: OptimizationRequest
) -> list[str]:
    explanations = [
        f"Renewables supplied {summary.renewable_share_pct:.1f}% of served energy.",
        f"Diesel supplied {summary.diesel_energy_kwh:.1f} kWh and produced "
        f"an estimated {summary.emissions_kg:.1f} kg CO2.",
    ]
    if summary.unserved_critical_kwh > 0:
        explanations.append(
            f"Warning: {summary.unserved_critical_kwh:.3f} kWh of critical demand could not be "
            "served within the configured physical limits."
        )
    if summary.unserved_flexible_kwh > 0:
        explanations.append(
            f"The plan deferred {summary.unserved_flexible_kwh:.3f} kWh of flexible demand to "
            "protect higher-priority needs."
        )
    if summary.reserve_shortfall_kwh > 0:
        explanations.append(
            f"Terminal battery reserve is short by {summary.reserve_shortfall_kwh:.3f} kWh; "
            "the soft reserve prevented solver failure and makes the risk visible."
        )
    else:
        explanations.append(
            f"The final battery SOC meets the {request.battery.reserve_target_kwh:.1f} kWh "
            "reserve target."
        )
    return explanations
