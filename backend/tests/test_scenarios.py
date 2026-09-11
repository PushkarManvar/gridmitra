import json
from pathlib import Path

import pytest

from app.models import OptimizationRequest
from app.services.optimizer import optimize_microgrid

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
CONTAINER_DATA = [Path("/app/data"), Path("/data")]

SCENARIOS = (
    "cloudy_day",
    "evening_demand_spike",
    "high_diesel_price",
    "battery_degradation",
    "combined_stress",
)


def load_scenario(name: str) -> OptimizationRequest:
    candidates = [DATA_DIR / f"{name}.json"] + [p / f"{name}.json" for p in CONTAINER_DATA]
    path = next((candidate for candidate in candidates if candidate.exists()), None)
    if path is None:
        raise FileNotFoundError(f"{name}.json not found")
    return OptimizationRequest.model_validate(json.loads(path.read_text(encoding="utf-8")))


def assert_balance(request: OptimizationRequest, result) -> None:
    inputs = {hour.hour_index: hour for hour in request.hours}
    for hour in result.dispatch_hours:
        source = inputs[hour.hour_index]
        supply = (
            hour.solar_used_kwh
            + hour.wind_used_kwh
            + hour.diesel_generation_kwh
            + hour.battery_discharge_kwh
            + hour.p1_unserved_kwh
            + hour.p2_unserved_kwh
            + hour.p3_unserved_kwh
            + hour.p4_unserved_kwh
        )
        demand = (
            source.p1_demand_kwh
            + source.p2_demand_kwh
            + source.p3_demand_kwh
            + source.p4_demand_kwh
            + hour.battery_charge_kwh
        )
        assert supply == pytest.approx(demand, abs=1e-5)


@pytest.mark.parametrize("name", SCENARIOS)
def test_scenario_solves_with_balanced_dispatch(name: str) -> None:
    request = load_scenario(name)
    result = optimize_microgrid(request)
    assert result.status in ("optimal", "emergency_plan")
    assert len(result.dispatch_hours) == 24
    assert_balance(request, result)
    assert result.baseline_summary is not None


def test_cloudy_uses_less_renewable_than_normal() -> None:
    cloudy = optimize_microgrid(load_scenario("cloudy_day"))
    normal = optimize_microgrid(load_scenario("demo_scenario"))
    assert cloudy.summary.renewable_used_kwh < normal.summary.renewable_used_kwh


def test_high_diesel_price_raises_cost() -> None:
    priced = optimize_microgrid(load_scenario("high_diesel_price"))
    normal = optimize_microgrid(load_scenario("demo_scenario"))
    assert priced.summary.fuel_cost >= normal.summary.fuel_cost


def test_combined_stress_reports_warnings_or_emergency() -> None:
    result = optimize_microgrid(load_scenario("combined_stress"))
    assert result.status in ("optimal", "emergency_plan")
    if result.status == "emergency_plan":
        assert len(result.warnings) > 0