from app.models import OptimizationRequest, OptimizationSummary
from app.services.constants import PRIORITIES


def compute_summary(
    request: OptimizationRequest,
    hour_results: list[dict],
    reserve_shortfall_kwh: float,
) -> OptimizationSummary:
    demand_by_p = {p: sum(getattr(h, f"{p}_demand_kwh") for h in request.hours) for p in PRIORITIES}
    total_demand = sum(demand_by_p.values())

    served_by_p = {
        p: sum(round(r[f"{p}_served_kwh"], 6) for r in hour_results) for p in PRIORITIES
    }
    unserved_by_p = {
        p: sum(round(r[f"{p}_unserved_kwh"], 6) for r in hour_results) for p in PRIORITIES
    }

    total_served = sum(served_by_p.values())
    total_unserved = sum(unserved_by_p.values())

    diesel_energy = sum(round(r["diesel_generation_kwh"], 6) for r in hour_results)
    fuel_l_per_kwh = request.assets.diesel.fuel_consumption_l_per_kwh
    diesel_fuel_l = diesel_energy * fuel_l_per_kwh
    fuel_cost = diesel_fuel_l * request.assets.diesel.fuel_price_per_l
    co2_kg = diesel_fuel_l * request.assets.diesel.emission_factor_kg_co2_per_l

    renewable_available = sum(
        h.solar_available_kwh + h.wind_available_kwh for h in request.hours
    )
    renewable_used = sum(
        round(r["solar_used_kwh"], 6) + round(r["wind_used_kwh"], 6) for r in hour_results
    )
    renewable_curtailment = sum(round(r["renewable_curtailment_kwh"], 6) for r in hour_results)

    p1_reliability = 100.0
    if demand_by_p["p1"] > 0:
        p1_reliability = 100 * (demand_by_p["p1"] - unserved_by_p["p1"]) / demand_by_p["p1"]

    return OptimizationSummary(
        total_demand_kwh=round(total_demand, 3),
        total_served_kwh=round(total_served, 3),
        total_unserved_kwh=round(total_unserved, 3),
        p1_unserved_kwh=round(unserved_by_p["p1"], 3),
        p2_unserved_kwh=round(unserved_by_p["p2"], 3),
        p3_unserved_kwh=round(unserved_by_p["p3"], 3),
        p4_unserved_kwh=round(unserved_by_p["p4"], 3),
        diesel_energy_kwh=round(diesel_energy, 2),
        diesel_fuel_l=round(diesel_fuel_l, 2),
        fuel_cost=round(fuel_cost, 2),
        co2_kg=round(co2_kg, 2),
        renewable_available_kwh=round(renewable_available, 2),
        renewable_used_kwh=round(renewable_used, 2),
        renewable_curtailment_kwh=round(renewable_curtailment, 2),
        renewable_share_percent=round(100 * renewable_used / total_served, 1)
        if total_served
        else 0.0,
        p1_reliability_percent=round(p1_reliability, 1),
        final_battery_energy_kwh=hour_results[-1]["battery_energy_end_kwh"],
        reserve_shortfall_kwh=round(reserve_shortfall_kwh, 3),
    )