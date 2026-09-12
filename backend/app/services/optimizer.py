import uuid
from dataclasses import dataclass

import pulp

from app.models import (
    DispatchHour,
    Explanation,
    OptimizationRequest,
    OptimizationResponse,
    OptimizationSummary,
    Persistence,
    Warning,
)
from app.services.baseline import compute_baseline_summary
from app.services.constants import (
    EPSILON,
    PRIORITIES,
    RESERVE_SHORTFALL_PENALTY_PER_KWH,
    UNSERVED_PENALTY_BY_PRIORITY,
)
from app.services.metrics import compute_summary


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
    unserved: dict[str, dict[int, pulp.LpVariable]]
    charge_mode: dict[int, pulp.LpVariable]
    reserve_shortfall: pulp.LpVariable


def _value(variable: pulp.LpVariable) -> float:
    value = pulp.value(variable)
    return round(float(value or 0), 6)


def optimize_microgrid(request: OptimizationRequest) -> OptimizationResponse:
    hours = sorted(request.hours, key=lambda item: item.hour_index)
    indices = range(24)
    battery = request.assets.battery
    diesel = request.assets.diesel
    interval = request.site.interval_hours
    carbon_price = request.operating_policy.carbon_price_per_kg_co2

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
            lowBound=battery.minimum_energy_kwh,
            upBound=battery.maximum_energy_kwh,
        ),
        unserved={
            priority: pulp.LpVariable.dicts(f"unserved_{priority}", indices, lowBound=0)
            for priority in PRIORITIES
        },
        charge_mode=pulp.LpVariable.dicts("charge_mode", indices, cat="Binary"),
        reserve_shortfall=pulp.LpVariable("reserve_shortfall", lowBound=0),
    )

    for index, hour in enumerate(hours):
        demand = {priority: getattr(hour, f"{priority}_demand_kwh") for priority in PRIORITIES}

        model += variables.solar[index] <= hour.solar_available_kwh
        model += variables.wind[index] <= hour.wind_available_kwh
        model += variables.diesel[index] <= diesel.maximum_kw * interval
        model += (
            variables.charge[index]
            <= battery.maximum_charge_kw * interval * variables.charge_mode[index]
        )
        model += variables.discharge[index] <= battery.maximum_discharge_kw * interval * (
            1 - variables.charge_mode[index]
        )
        for priority in PRIORITIES:
            model += variables.unserved[priority][index] <= demand[priority]

        model += (
            variables.solar[index]
            + variables.wind[index]
            + variables.diesel[index]
            + variables.discharge[index]
            + sum(variables.unserved[priority][index] for priority in PRIORITIES)
            == sum(demand.values()) + variables.charge[index]
        )

        previous_soc = battery.initial_energy_kwh if index == 0 else variables.soc[index - 1]
        model += variables.soc[index] == (
            previous_soc
            + battery.charge_efficiency * variables.charge[index]
            - variables.discharge[index] * (1 / battery.discharge_efficiency)
        )

    model += variables.reserve_shortfall <= battery.terminal_reserve_target_kwh
    model += (
        variables.soc[23] + variables.reserve_shortfall
        >= battery.terminal_reserve_target_kwh
    )

    diesel_unit_cost = diesel.fuel_consumption_l_per_kwh * (
        diesel.fuel_price_per_l + carbon_price * diesel.emission_factor_kg_co2_per_l
    )
    model += (
        pulp.lpSum(variables.diesel[i] * diesel_unit_cost for i in indices)
        + pulp.lpSum(
            (variables.charge[i] + variables.discharge[i])
            * battery.wear_cost_per_kwh
            for i in indices
        )
        + pulp.lpSum(
            variables.unserved[priority][i] * UNSERVED_PENALTY_BY_PRIORITY[priority]
            for priority in PRIORITIES
            for i in indices
        )
        + variables.reserve_shortfall * RESERVE_SHORTFALL_PENALTY_PER_KWH
    )

    status_name = pulp.LpStatus[model.solve(pulp.PULP_CBC_CMD(msg=False))]
    if status_name != "Optimal":
        raise OptimizationError(f"Solver returned {status_name}")

    reserve_shortfall = _value(variables.reserve_shortfall)
    dispatch_hours = [
        _build_dispatch_hour(
            hour,
            variables,
            index,
            battery.initial_energy_kwh if index == 0 else _value(variables.soc[index - 1]),
            diesel,
        )
        for index, hour in enumerate(hours)
    ]

    summary = compute_summary(request, _hour_result_dicts(dispatch_hours), reserve_shortfall)
    baseline_summary = compute_baseline_summary(request)

    total_unserved = (
        summary.p1_unserved_kwh
        + summary.p2_unserved_kwh
        + summary.p3_unserved_kwh
        + summary.p4_unserved_kwh
    )
    status = (
        "emergency_plan"
        if (total_unserved > EPSILON or reserve_shortfall > EPSILON)
        else "optimal"
    )

    return OptimizationResponse(
        run_id=str(uuid.uuid4()),
        status=status,
        scenario_id=request.scenario_id,
        summary=summary,
        dispatch_hours=dispatch_hours,
        baseline_summary=baseline_summary,
        explanations=_build_explanations(request, dispatch_hours, summary),
        warnings=_build_warnings(dispatch_hours, summary),
        persistence=Persistence(saved=False),
    )


def _build_dispatch_hour(
    hour,
    variables: Variables,
    index: int,
    battery_energy_start: float,
    diesel,
) -> DispatchHour:
    demand = {
        priority: getattr(hour, f"{priority}_demand_kwh") for priority in PRIORITIES
    }
    unserved = {
        priority: _value(variables.unserved[priority][index]) for priority in PRIORITIES
    }
    solar_used = _value(variables.solar[index])
    wind_used = _value(variables.wind[index])
    diesel_generation = _value(variables.diesel[index])
    battery_charge = _value(variables.charge[index])
    battery_discharge = _value(variables.discharge[index])
    battery_energy_end = _value(variables.soc[index])
    curtailment = (
        hour.solar_available_kwh + hour.wind_available_kwh - solar_used - wind_used
    )
    fuel_used_l = diesel_generation * diesel.fuel_consumption_l_per_kwh
    return DispatchHour(
        hour_index=hour.hour_index,
        timestamp=hour.timestamp,
        solar_available_kwh=hour.solar_available_kwh,
        solar_used_kwh=solar_used,
        wind_available_kwh=hour.wind_available_kwh,
        wind_used_kwh=wind_used,
        battery_energy_start_kwh=battery_energy_start,
        battery_charge_kwh=battery_charge,
        battery_discharge_kwh=battery_discharge,
        battery_energy_end_kwh=battery_energy_end,
        diesel_generation_kwh=diesel_generation,
        p1_demand_kwh=demand["p1"],
        p2_demand_kwh=demand["p2"],
        p3_demand_kwh=demand["p3"],
        p4_demand_kwh=demand["p4"],
        p1_served_kwh=round(demand["p1"] - unserved["p1"], 6),
        p2_served_kwh=round(demand["p2"] - unserved["p2"], 6),
        p3_served_kwh=round(demand["p3"] - unserved["p3"], 6),
        p4_served_kwh=round(demand["p4"] - unserved["p4"], 6),
        p1_unserved_kwh=unserved["p1"],
        p2_unserved_kwh=unserved["p2"],
        p3_unserved_kwh=unserved["p3"],
        p4_unserved_kwh=unserved["p4"],
        renewable_curtailment_kwh=round(curtailment, 6),
        fuel_cost=round(fuel_used_l * diesel.fuel_price_per_l, 4),
        co2_kg=round(fuel_used_l * diesel.emission_factor_kg_co2_per_l, 4),
    )


def _hour_result_dicts(dispatch_hours: list[DispatchHour]) -> list[dict]:
    return [
        {
            "solar_used_kwh": hour.solar_used_kwh,
            "wind_used_kwh": hour.wind_used_kwh,
            "diesel_generation_kwh": hour.diesel_generation_kwh,
            "renewable_curtailment_kwh": hour.renewable_curtailment_kwh,
            "battery_energy_end_kwh": hour.battery_energy_end_kwh,
            "p1_served_kwh": hour.p1_served_kwh,
            "p2_served_kwh": hour.p2_served_kwh,
            "p3_served_kwh": hour.p3_served_kwh,
            "p4_served_kwh": hour.p4_served_kwh,
            "p1_unserved_kwh": hour.p1_unserved_kwh,
            "p2_unserved_kwh": hour.p2_unserved_kwh,
            "p3_unserved_kwh": hour.p3_unserved_kwh,
            "p4_unserved_kwh": hour.p4_unserved_kwh,
            "fuel_cost": hour.fuel_cost,
            "co2_kg": hour.co2_kg,
        }
        for hour in dispatch_hours
    ]


def _build_explanations(
    request: OptimizationRequest,
    dispatch_hours: list[DispatchHour],
    summary: OptimizationSummary,
) -> list[Explanation]:
    explanations = [
        Explanation(
            code="RENEWABLE_SHARE",
            severity="info",
            message=(
                f"Renewables supplied {summary.renewable_share_percent:.1f}% of served energy."
            ),
            evidence={"renewable_share_percent": summary.renewable_share_percent},
        ),
        Explanation(
            code="DIESEL_USE",
            severity="info",
            message=(
                f"Diesel supplied {summary.diesel_energy_kwh:.1f} kWh, using "
                f"{summary.diesel_fuel_l:.1f} litres and producing an estimated "
                f"{summary.co2_kg:.1f} kg CO2."
            ),
            evidence={
                "diesel_energy_kwh": summary.diesel_energy_kwh,
                "diesel_fuel_l": summary.diesel_fuel_l,
                "co2_kg": summary.co2_kg,
            },
        ),
    ]

    for hour in dispatch_hours:
        if hour.diesel_generation_kwh > 1e-6:
            explanations.append(
                Explanation(
                    code="DIESEL_ACTIVATED",
                    severity="info",
                    hour_index=hour.hour_index,
                    message=(
                        "Diesel was activated because renewable supply and permitted "
                        "battery discharge could not satisfy forecast demand."
                    ),
                    evidence={
                        "diesel_kwh": hour.diesel_generation_kwh,
                        "renewable_kwh": hour.solar_used_kwh + hour.wind_used_kwh,
                        "demand_kwh": (
                            hour.p1_demand_kwh
                            + hour.p2_demand_kwh
                            + hour.p3_demand_kwh
                            + hour.p4_demand_kwh
                        ),
                    },
                )
            )
        if hour.renewable_curtailment_kwh > 1e-6:
            explanations.append(
                Explanation(
                    code="RENEWABLE_CURTAILED",
                    severity="info",
                    hour_index=hour.hour_index,
                    message=(
                        "Renewable energy was curtailed because demand was already "
                        "satisfied and the battery had reached its charging limit."
                    ),
                    evidence={"curtailment_kwh": hour.renewable_curtailment_kwh},
                )
            )
        if hour.p4_unserved_kwh > EPSILON or hour.p3_unserved_kwh > EPSILON or hour.p2_unserved_kwh > EPSILON:
            for priority, attribute in (
                ("p4", "p4_unserved_kwh"),
                ("p3", "p3_unserved_kwh"),
                ("p2", "p2_unserved_kwh"),
            ):
                unserved_kwh = getattr(hour, attribute)
                if unserved_kwh > EPSILON:
                    explanations.append(
                        Explanation(
                            code=f"{priority.upper()}_REDUCED",
                            severity="warning",
                            hour_index=hour.hour_index,
                            message=(
                                f"{unserved_kwh:.3f} kWh of {priority.upper()} demand was "
                                "reduced to protect higher-priority services during a supply "
                                "shortage."
                            ),
                            evidence={f"{priority}_unserved_kwh": unserved_kwh},
                        )
                    )

    if summary.p1_unserved_kwh > EPSILON:
        explanations.append(
            Explanation(
                code="P1_UNSERVED",
                severity="critical",
                message=(
                    f"{summary.p1_unserved_kwh:.3f} kWh of critical P1 demand could not "
                    "be served within the configured physical limits."
                ),
                evidence={"p1_unserved_kwh": summary.p1_unserved_kwh},
            )
        )
    if summary.reserve_shortfall_kwh > EPSILON:
        explanations.append(
            Explanation(
                code="RESERVE_SHORTFALL",
                severity="warning",
                message=(
                    f"The terminal reserve target is short by {summary.reserve_shortfall_kwh:.3f} "
                    "kWh; the soft reserve prevented solver failure and makes the risk visible."
                ),
                evidence={"reserve_shortfall_kwh": summary.reserve_shortfall_kwh},
            )
        )
    else:
        explanations.append(
            Explanation(
                code="RESERVE_MET",
                severity="info",
                message=(
                    f"The final battery energy meets the "
                    f"{request.assets.battery.terminal_reserve_target_kwh:.1f} kWh reserve target."
                ),
                evidence={"reserve_target_kwh": request.assets.battery.terminal_reserve_target_kwh},
            )
        )
    return explanations


def _build_warnings(
    dispatch_hours: list[DispatchHour],
    summary: OptimizationSummary,
) -> list[Warning]:
    warnings: list[Warning] = []
    if summary.p1_unserved_kwh > EPSILON:
        warnings.append(
            Warning(
                code="P1_UNSERVED",
                severity="critical",
                message="Critical P1 demand could not be fully served.",
            )
        )
    for priority, attribute in (
        ("P4", "p4_unserved_kwh"),
        ("P3", "p3_unserved_kwh"),
        ("P2", "p2_unserved_kwh"),
    ):
        unserved_kwh = getattr(summary, attribute)
        if unserved_kwh > EPSILON:
            warnings.append(
                Warning(
                    code=f"{priority}_REDUCED",
                    severity="warning",
                    message=(
                        f"{unserved_kwh:.3f} kWh of {priority} demand was reduced to "
                        "protect higher-priority services."
                    ),
                )
            )
    if summary.reserve_shortfall_kwh > EPSILON:
        warnings.append(
            Warning(
                code="RESERVE_SHORTFALL",
                severity="warning",
                message="Terminal battery reserve target could not be met.",
            )
        )
    total_curtailment = sum(hour.renewable_curtailment_kwh for hour in dispatch_hours)
    if total_curtailment > EPSILON:
        warnings.append(
            Warning(
                code="RENEWABLE_CURTAILMENT",
                severity="info",
                message=f"{total_curtailment:.1f} kWh of renewable availability was curtailed.",
            )
        )
    return warnings