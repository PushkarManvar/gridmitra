import json
from pathlib import Path

import pytest

from app.models import OptimizationRequest
from app.services.baseline import compute_baseline_summary
from app.services.constants import EPSILON, PRIORITIES
from app.services.optimizer import optimize_microgrid


def load_demo() -> OptimizationRequest:
    repo_root = Path(__file__).resolve().parents[2]
    candidates = [
        repo_root / "data" / "demo_scenario.json",
        Path("/app/data/demo_scenario.json"),
        Path("/data/demo_scenario.json"),
    ]
    path = next((candidate for candidate in candidates if candidate.exists()), None)
    if path is None:
        raise FileNotFoundError("demo_scenario.json not found in any known location")
    return OptimizationRequest.model_validate(json.loads(path.read_text(encoding="utf-8")))


def zero_renewables(payload: dict) -> None:
    for hour in payload["hours"]:
        hour["solar_available_kwh"] = 0
        hour["wind_available_kwh"] = 0


def set_uniform_demand(payload: dict, value: float) -> None:
    for hour in payload["hours"]:
        for priority in PRIORITIES:
            hour[f"{priority}_demand_kwh"] = value


# ---- TEST_PLAN O01-O12 ----

def test_o01_normal_day_is_optimal_and_balanced() -> None:
    request = load_demo()
    result = optimize_microgrid(request)
    assert result.status == "optimal"
    assert len(result.dispatch_hours) == 24
    assert result.summary.p1_unserved_kwh == pytest.approx(0, abs=EPSILON)
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
        assert hour.diesel_generation_kwh <= request.assets.diesel.maximum_kw + EPSILON
        assert (
            hour.battery_energy_end_kwh
            <= request.assets.battery.maximum_energy_kwh + EPSILON
        )


def test_o02_zero_renewable_availability() -> None:
    payload = load_demo().model_dump()
    zero_renewables(payload)
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.status in ("optimal", "emergency_plan")
    for hour in result.dispatch_hours:
        assert hour.solar_used_kwh == pytest.approx(0, abs=EPSILON)
        assert hour.wind_used_kwh == pytest.approx(0, abs=EPSILON)


def test_o03_renewable_surplus_charges_battery_then_curtails() -> None:
    payload = load_demo().model_dump()
    for hour in payload["hours"]:
        if 7 <= hour["hour_index"] <= 17:
            hour["solar_available_kwh"] = 40.0
            hour["p1_demand_kwh"] = 2.0
            hour["p2_demand_kwh"] = 1.0
            hour["p3_demand_kwh"] = 1.0
            hour["p4_demand_kwh"] = 1.0
        elif hour["hour_index"] >= 18:
            hour["solar_available_kwh"] = 0.0
            hour["p1_demand_kwh"] = 15.0
            hour["p2_demand_kwh"] = 5.0
            hour["p3_demand_kwh"] = 5.0
            hour["p4_demand_kwh"] = 5.0
        else:
            hour["solar_available_kwh"] = 0.0
            hour["p1_demand_kwh"] = 2.0
            hour["p2_demand_kwh"] = 1.0
            hour["p3_demand_kwh"] = 1.0
            hour["p4_demand_kwh"] = 1.0
        hour["wind_available_kwh"] = 0
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.status == "optimal"
    assert sum(hour.battery_charge_kwh for hour in result.dispatch_hours) > 0
    assert result.summary.renewable_curtailment_kwh > 0
    maximum = payload["assets"]["battery"]["maximum_energy_kwh"]
    for hour in result.dispatch_hours:
        assert hour.battery_energy_end_kwh <= maximum + EPSILON


def test_o04_full_battery_causes_curtailment() -> None:
    payload = load_demo().model_dump()
    battery = payload["assets"]["battery"]
    battery["initial_energy_kwh"] = battery["maximum_energy_kwh"]
    battery["terminal_reserve_target_kwh"] = battery["maximum_energy_kwh"]
    set_uniform_demand(payload, 1.0)
    for hour in payload["hours"]:
        hour["solar_available_kwh"] = 20.0
        hour["wind_available_kwh"] = 0
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.status == "optimal"
    assert result.summary.renewable_curtailment_kwh > 0
    maximum = payload["assets"]["battery"]["maximum_energy_kwh"]
    for hour in result.dispatch_hours:
        assert hour.battery_energy_end_kwh <= maximum + EPSILON


def test_o05_optimizer_reserves_battery_for_evening_spike() -> None:
    payload = load_demo().model_dump()
    zero_renewables(payload)
    for hour in payload["hours"]:
        if hour["hour_index"] == 19:
            hour["p1_demand_kwh"] = 60.0
            hour["p2_demand_kwh"] = 5.0
            hour["p3_demand_kwh"] = 5.0
            hour["p4_demand_kwh"] = 5.0
        else:
            hour["p1_demand_kwh"] = 10.0
            hour["p2_demand_kwh"] = 2.0
            hour["p3_demand_kwh"] = 2.0
            hour["p4_demand_kwh"] = 2.0
    request = OptimizationRequest.model_validate(payload)
    result = optimize_microgrid(request)
    baseline = compute_baseline_summary(request)
    assert result.summary.p1_unserved_kwh < baseline.p1_unserved_kwh
    assert result.summary.total_served_kwh > baseline.total_served_kwh
    assert (
        result.summary.final_battery_energy_kwh >= baseline.final_battery_energy_kwh
    )


def test_o06_p4_reduced_before_p1() -> None:
    payload = load_demo().model_dump()
    zero_renewables(payload)
    set_uniform_demand(payload, 5.0)
    payload["assets"]["diesel"]["maximum_kw"] = 5.0
    payload["assets"]["battery"]["initial_energy_kwh"] = payload["assets"]["battery"][
        "minimum_energy_kwh"
    ]
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.status == "emergency_plan"
    assert result.summary.p4_unserved_kwh > 0
    assert result.summary.p3_unserved_kwh > 0
    assert result.summary.p2_unserved_kwh > 0
    assert result.summary.p1_unserved_kwh == pytest.approx(0, abs=EPSILON)


def test_o07_p1_served_before_terminal_reserve() -> None:
    payload = load_demo().model_dump()
    battery = payload["assets"]["battery"]
    battery["initial_energy_kwh"] = battery["minimum_energy_kwh"]
    battery["terminal_reserve_target_kwh"] = battery["maximum_energy_kwh"]
    zero_renewables(payload)
    set_uniform_demand(payload, 0.0)
    for hour in payload["hours"]:
        hour["p1_demand_kwh"] = 3.0
    payload["assets"]["diesel"]["maximum_kw"] = 3.0
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.summary.p1_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert result.summary.reserve_shortfall_kwh > 0


def test_o08_reserve_shortfall_reported() -> None:
    payload = load_demo().model_dump()
    battery = payload["assets"]["battery"]
    battery["initial_energy_kwh"] = battery["minimum_energy_kwh"]
    battery["terminal_reserve_target_kwh"] = battery["maximum_energy_kwh"]
    zero_renewables(payload)
    set_uniform_demand(payload, 0.0)
    payload["assets"]["diesel"]["maximum_kw"] = 0.0
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.status == "emergency_plan"
    assert result.summary.reserve_shortfall_kwh == pytest.approx(
        payload["assets"]["battery"]["maximum_energy_kwh"]
        - payload["assets"]["battery"]["minimum_energy_kwh"],
        abs=EPSILON,
    )


def test_o09_insufficient_supply_returns_emergency_plan() -> None:
    payload = load_demo().model_dump()
    zero_renewables(payload)
    set_uniform_demand(payload, 0.0)
    for hour in payload["hours"]:
        hour["p1_demand_kwh"] = 100.0
    payload["assets"]["diesel"]["maximum_kw"] = 0.01
    payload["assets"]["battery"]["initial_energy_kwh"] = payload["assets"]["battery"][
        "minimum_energy_kwh"
    ]
    payload["assets"]["battery"]["terminal_reserve_target_kwh"] = payload["assets"][
        "battery"
    ]["maximum_energy_kwh"]
    result = optimize_microgrid(OptimizationRequest.model_validate(payload))
    assert result.status == "emergency_plan"
    assert result.summary.p1_unserved_kwh > 0
    assert result.summary.reserve_shortfall_kwh > 0
    assert any(w.code == "P1_UNSERVED" for w in result.warnings)


def test_o10_no_simultaneous_charge_and_discharge() -> None:
    result = optimize_microgrid(load_demo())
    for hour in result.dispatch_hours:
        assert not (
            hour.battery_charge_kwh > EPSILON and hour.battery_discharge_kwh > EPSILON
        )


def test_o11_diesel_never_exceeds_capacity() -> None:
    request = load_demo()
    result = optimize_microgrid(request)
    for hour in result.dispatch_hours:
        assert hour.diesel_generation_kwh <= request.assets.diesel.maximum_kw + EPSILON


def test_o12_deterministic() -> None:
    request = load_demo()
    first = optimize_microgrid(request)
    second = optimize_microgrid(request)
    assert first.summary.model_dump() == second.summary.model_dump()
    assert [hour.model_dump() for hour in first.dispatch_hours] == [
        hour.model_dump() for hour in second.dispatch_hours
    ]


# ---- TEST_PLAN section 5 baseline tests ----

def test_baseline_uses_renewables_before_diesel() -> None:
    payload = load_demo().model_dump()
    set_uniform_demand(payload, 5.0)
    for hour in payload["hours"]:
        hour["solar_available_kwh"] = 50.0
        hour["wind_available_kwh"] = 10.0
    request = OptimizationRequest.model_validate(payload)
    baseline = compute_baseline_summary(request)
    assert baseline.diesel_energy_kwh == pytest.approx(0, abs=EPSILON)
    assert baseline.renewable_curtailment_kwh > 0


def test_baseline_discharge_stops_at_hard_minimum() -> None:
    payload = load_demo().model_dump()
    minimum = payload["assets"]["battery"]["minimum_energy_kwh"]
    zero_renewables(payload)
    set_uniform_demand(payload, 0.0)
    for hour in payload["hours"]:
        hour["p1_demand_kwh"] = 10.0
    payload["assets"]["diesel"]["maximum_kw"] = 0.0
    request = OptimizationRequest.model_validate(payload)
    baseline = compute_baseline_summary(request)
    assert baseline.final_battery_energy_kwh == pytest.approx(minimum, abs=EPSILON)
    assert baseline.total_unserved_kwh > 0


def test_baseline_reduction_follows_p4_to_p1() -> None:
    payload = load_demo().model_dump()
    zero_renewables(payload)
    set_uniform_demand(payload, 5.0)
    payload["assets"]["diesel"]["maximum_kw"] = 5.0
    payload["assets"]["battery"]["initial_energy_kwh"] = payload["assets"]["battery"][
        "minimum_energy_kwh"
    ]
    request = OptimizationRequest.model_validate(payload)
    baseline = compute_baseline_summary(request)
    assert baseline.p4_unserved_kwh > 0
    assert baseline.p3_unserved_kwh > 0
    assert baseline.p2_unserved_kwh > 0
    assert baseline.p1_unserved_kwh == pytest.approx(0, abs=EPSILON)


def test_baseline_is_deterministic() -> None:
    request = load_demo()
    assert compute_baseline_summary(request).model_dump() == compute_baseline_summary(
        request
    ).model_dump()


# ---- BUG 1 / BUG 2 regression: any shedding is an emergency plan, with
#      explanations and warnings for P4/P3/P2 reduction ----


def _shedding_payload(
    *,
    p1: float = 0.0,
    p2: float = 0.0,
    p3: float = 0.0,
    p4: float = 0.0,
    diesel_max: float = 5.0,
) -> dict:
    payload = load_demo().model_dump()
    zero_renewables(payload)
    for hour in payload["hours"]:
        hour["p1_demand_kwh"] = p1
        hour["p2_demand_kwh"] = p2
        hour["p3_demand_kwh"] = p3
        hour["p4_demand_kwh"] = p4
    battery = payload["assets"]["battery"]
    battery["initial_energy_kwh"] = battery["minimum_energy_kwh"]
    battery["terminal_reserve_target_kwh"] = battery["minimum_energy_kwh"]
    payload["assets"]["diesel"]["maximum_kw"] = diesel_max
    return payload


def _codes(items) -> set[str]:
    return {item.code for item in items}


def test_status_emergency_for_p4_only_shedding() -> None:
    result = optimize_microgrid(
        OptimizationRequest.model_validate(_shedding_payload(p4=10.0))
    )
    assert result.status == "emergency_plan"
    assert result.summary.p4_unserved_kwh > EPSILON
    assert result.summary.p3_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert result.summary.p2_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert result.summary.p1_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert "P4_REDUCED" in _codes(result.warnings)
    assert "P3_REDUCED" not in _codes(result.warnings)
    assert "P2_REDUCED" not in _codes(result.warnings)
    assert "P4_REDUCED" in _codes(result.explanations)


def test_status_emergency_for_p3_shedding() -> None:
    result = optimize_microgrid(
        OptimizationRequest.model_validate(_shedding_payload(p3=10.0))
    )
    assert result.status == "emergency_plan"
    assert result.summary.p3_unserved_kwh > EPSILON
    assert result.summary.p4_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert result.summary.p2_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert "P3_REDUCED" in _codes(result.warnings)
    assert "P3_REDUCED" in _codes(result.explanations)
    assert "P4_REDUCED" not in _codes(result.warnings)


def test_status_emergency_for_p2_shedding() -> None:
    result = optimize_microgrid(
        OptimizationRequest.model_validate(_shedding_payload(p2=10.0))
    )
    assert result.status == "emergency_plan"
    assert result.summary.p2_unserved_kwh > EPSILON
    assert result.summary.p1_unserved_kwh == pytest.approx(0, abs=EPSILON)
    assert "P2_REDUCED" in _codes(result.warnings)
    assert "P2_REDUCED" in _codes(result.explanations)


def test_status_emergency_for_p3_and_p4_shedding_with_priority_order() -> None:
    result = optimize_microgrid(
        OptimizationRequest.model_validate(_shedding_payload(p3=10.0, p4=10.0))
    )
    assert result.status == "emergency_plan"
    # priority order unchanged: P4 is fully shed before P3 is touched
    assert result.summary.p4_unserved_kwh == pytest.approx(10.0 * 24, abs=1)
    assert result.summary.p3_unserved_kwh == pytest.approx(5.0 * 24, abs=1)
    assert "P4_REDUCED" in _codes(result.warnings)
    assert "P3_REDUCED" in _codes(result.warnings)
    assert (result.summary.p3_unserved_kwh + result.summary.p4_unserved_kwh) == pytest.approx(
        15.0 * 24, abs=1
    )


def test_explanation_kwh_matches_dispatch_totals() -> None:
    result = optimize_microgrid(
        OptimizationRequest.model_validate(_shedding_payload(p3=8.0, p4=6.0))
    )
    explained_p3 = sum(
        item.evidence.get("p3_unserved_kwh", 0.0)
        for item in result.explanations
        if item.code == "P3_REDUCED"
    )
    explained_p4 = sum(
        item.evidence.get("p4_unserved_kwh", 0.0)
        for item in result.explanations
        if item.code == "P4_REDUCED"
    )
    assert explained_p3 == pytest.approx(result.summary.p3_unserved_kwh, abs=1e-3)
    assert explained_p4 == pytest.approx(result.summary.p4_unserved_kwh, abs=1e-3)


def test_no_reduction_warning_when_nothing_shed() -> None:
    result = optimize_microgrid(load_demo())
    assert result.status == "optimal"
    assert not any(code in _codes(result.warnings) for code in ("P4_REDUCED", "P3_REDUCED", "P2_REDUCED"))


def test_p1_unserved_still_critical_with_explanation() -> None:
    result = optimize_microgrid(
        OptimizationRequest.model_validate(_shedding_payload(p1=10.0, diesel_max=5.0))
    )
    assert result.status == "emergency_plan"
    assert result.summary.p1_unserved_kwh > EPSILON
    p1_warnings = [w for w in result.warnings if w.code == "P1_UNSERVED"]
    assert p1_warnings and p1_warnings[0].severity == "critical"
    assert any(e.code == "P1_UNSERVED" and e.severity == "critical" for e in result.explanations)