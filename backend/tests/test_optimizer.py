import json
from pathlib import Path

import pytest

from app.models import OptimizationRequest
from app.services.optimizer import optimize_microgrid


def load_demo() -> OptimizationRequest:
    path = Path(__file__).resolve().parents[2] / "data" / "demo_scenario.json"
    return OptimizationRequest.model_validate(json.loads(path.read_text(encoding="utf-8")))


def test_demo_scenario_is_optimal_and_balanced() -> None:
    request = load_demo()
    result = optimize_microgrid(request)

    assert result.status == "optimal"
    assert len(result.hours) == 24
    assert result.summary.unserved_critical_kwh == pytest.approx(0)

    inputs = {item.hour: item for item in request.hours}
    for item in result.hours:
        source = inputs[item.hour]
        supply = (
            item.solar_kwh
            + item.wind_kwh
            + item.diesel_kwh
            + item.battery_discharge_kwh
            + item.unserved_critical_kwh
            + item.unserved_flexible_kwh
        )
        demand = (
            source.critical_load_kwh
            + source.flexible_load_kwh
            + item.battery_charge_kwh
        )
        assert supply == pytest.approx(demand, abs=1e-5)


def test_soft_reserve_keeps_extreme_scenario_solvable() -> None:
    payload = load_demo().model_dump()
    for hour in payload["hours"]:
        hour["critical_load_kwh"] = 100
        hour["flexible_load_kwh"] = 0
        hour["solar_available_kwh"] = 0
        hour["wind_available_kwh"] = 0
    payload["diesel"]["max_power_kw"] = 0.01
    payload["battery"]["initial_soc_kwh"] = payload["battery"]["min_soc_kwh"]
    payload["battery"]["reserve_target_kwh"] = payload["battery"]["max_soc_kwh"]

    result = optimize_microgrid(OptimizationRequest.model_validate(payload))

    assert result.status == "optimal"
    assert result.summary.reserve_shortfall_kwh > 0
    assert result.summary.unserved_critical_kwh > 0


def test_no_hour_charges_and_discharges_together() -> None:
    result = optimize_microgrid(load_demo())
    for hour in result.hours:
        assert not (hour.battery_charge_kwh > 1e-6 and hour.battery_discharge_kwh > 1e-6)
