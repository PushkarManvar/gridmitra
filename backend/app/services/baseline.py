from app.models import OptimizationRequest, OptimizationSummary
from app.services.constants import PRIORITIES
from app.services.metrics import compute_summary


def compute_baseline_summary(request: OptimizationRequest) -> OptimizationSummary:
    """Greedy reactive no-lookahead dispatch. See OPTIMIZATION_MODEL.md section 8.

    Order per hour: use renewables for demand, charge battery with immediate
    surplus, discharge to the hard minimum, use diesel for the remaining
    deficit, then reduce P4 to P1. Never plans around future demand.
    """
    battery = request.assets.battery
    diesel = request.assets.diesel
    interval = request.site.interval_hours

    soc = battery.initial_energy_kwh
    results: list[dict] = []

    for hour in request.hours:
        demand = {p: getattr(hour, f"{p}_demand_kwh") for p in PRIORITIES}
        total_demand = sum(demand.values())
        remaining = total_demand

        solar_used = min(hour.solar_available_kwh, remaining)
        remaining -= solar_used
        wind_used = min(hour.wind_available_kwh, remaining)
        remaining -= wind_used

        surplus = (hour.solar_available_kwh - solar_used) + (
            hour.wind_available_kwh - wind_used
        )
        charge_capacity = min(
            battery.maximum_charge_kw * interval,
            (battery.maximum_energy_kwh - soc) / battery.charge_efficiency,
        )
        charge = min(surplus, charge_capacity)
        soc += battery.charge_efficiency * charge

        discharge = 0.0
        if remaining > 0:
            discharge = min(
                battery.maximum_discharge_kw * interval,
                (soc - battery.minimum_energy_kwh) * battery.discharge_efficiency,
                remaining,
            )
            soc -= discharge / battery.discharge_efficiency
            remaining -= discharge

        diesel_generation = 0.0
        if remaining > 0:
            diesel_generation = min(diesel.maximum_kw * interval, remaining)
            remaining -= diesel_generation

        unserved = {p: 0.0 for p in PRIORITIES}
        for priority in ("p4", "p3", "p2", "p1"):
            if remaining > 0:
                amount = min(demand[priority], remaining)
                unserved[priority] = amount
                remaining -= amount

        served = {p: demand[p] - unserved[p] for p in PRIORITIES}
        fuel_used_l = diesel_generation * diesel.fuel_consumption_l_per_kwh
        curtailment = (
            hour.solar_available_kwh
            + hour.wind_available_kwh
            - solar_used
            - wind_used
        )
        results.append(
            {
                "solar_used_kwh": solar_used,
                "wind_used_kwh": wind_used,
                "diesel_generation_kwh": diesel_generation,
                "renewable_curtailment_kwh": curtailment,
                "battery_energy_end_kwh": soc,
                "p1_served_kwh": served["p1"],
                "p2_served_kwh": served["p2"],
                "p3_served_kwh": served["p3"],
                "p4_served_kwh": served["p4"],
                "p1_unserved_kwh": unserved["p1"],
                "p2_unserved_kwh": unserved["p2"],
                "p3_unserved_kwh": unserved["p3"],
                "p4_unserved_kwh": unserved["p4"],
                "fuel_cost": fuel_used_l * diesel.fuel_price_per_l,
                "co2_kg": fuel_used_l * diesel.emission_factor_kg_co2_per_l,
            }
        )

    return compute_summary(request, results, reserve_shortfall_kwh=0.0)