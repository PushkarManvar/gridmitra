import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.models import OperatingPolicy, OptimizationRequest, ScenarioType

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_demo() -> dict:
    candidates = [
        REPO_ROOT / "data" / "demo_scenario.json",
        Path("/app/data/demo_scenario.json"),
        Path("/data/demo_scenario.json"),
    ]
    path = next((candidate for candidate in candidates if candidate.exists()), None)
    if path is None:
        raise FileNotFoundError("demo_scenario.json not found in any known location")
    return json.loads(path.read_text(encoding="utf-8"))


def load_mock() -> dict:
    candidates = [
        REPO_ROOT / "backend" / "app" / "data" / "mock_response.json",
        Path("/app/app/data/mock_response.json"),
        Path("/app/data/mock_response.json"),
    ]
    path = next((candidate for candidate in candidates if candidate.exists()), None)
    if path is None:
        raise FileNotFoundError("mock_response.json not found in any known location")
    return json.loads(path.read_text(encoding="utf-8"))


class TestT21RequestSchema:
    def test_scenario_type_enum_matches_contract(self) -> None:
        assert {item.value for item in ScenarioType} == {
            "normal",
            "cloudy",
            "demand_spike",
            "high_diesel_price",
            "battery_degradation",
            "combined_stress",
            "custom",
        }

    def test_operating_policy_exposes_only_carbon_price(self) -> None:
        assert set(OperatingPolicy.model_fields) == {"carbon_price_per_kg_co2"}

    def test_demo_payload_validates_against_request_schema(self) -> None:
        request = OptimizationRequest.model_validate(load_demo())
        assert request.scenario_type == ScenarioType.normal
        assert request.site.interval_hours == 1

    def test_interval_hours_must_equal_one(self) -> None:
        payload = load_demo()
        payload["site"]["interval_hours"] = 2
        with pytest.raises(ValidationError):
            OptimizationRequest.model_validate(payload)

    def test_unsupported_scenario_type_rejected(self) -> None:
        payload = load_demo()
        payload["scenario_type"] = "not_a_scenario"
        with pytest.raises(ValidationError):
            OptimizationRequest.model_validate(payload)

    def test_initial_energy_must_be_within_hard_bounds(self) -> None:
        payload = load_demo()
        payload["assets"]["battery"]["initial_energy_kwh"] = 500
        with pytest.raises(ValidationError):
            OptimizationRequest.model_validate(payload)


class TestT22DemoData:
    def test_twenty_four_unique_hours(self) -> None:
        payload = load_demo()
        indices = [hour["hour_index"] for hour in payload["hours"]]
        assert len(payload["hours"]) == 24
        assert sorted(indices) == list(range(24))

    def test_all_values_non_negative(self) -> None:
        payload = load_demo()
        for hour in payload["hours"]:
            for key, value in hour.items():
                if isinstance(value, int | float) and key != "hour_index":
                    assert value >= 0, f"negative value for {key} at hour {hour['hour_index']}"

    def test_load_priority_realism(self) -> None:
        payload = load_demo()
        for hour in payload["hours"][:3]:
            p1 = hour["p1_demand_kwh"]
            p2 = hour["p2_demand_kwh"]
            p3 = hour["p3_demand_kwh"]
            p4 = hour["p4_demand_kwh"]
            assert p1 < p2 < p3 < p4, (
                f"P4 must be largest, P1 smallest at hour {hour['hour_index']}"
            )

    def test_unit_suffixes_present(self) -> None:
        payload = load_demo()
        for hour in payload["hours"]:
            assert set(hour) >= {
                "solar_available_kwh",
                "wind_available_kwh",
                "p1_demand_kwh",
                "p2_demand_kwh",
                "p3_demand_kwh",
                "p4_demand_kwh",
            }
        battery = payload["assets"]["battery"]
        assert set(battery) >= {
            "capacity_kwh",
            "initial_energy_kwh",
            "maximum_charge_kw",
            "maximum_discharge_kw",
        }

    def test_validates_against_t21_schemas(self) -> None:
        OptimizationRequest.model_validate(load_demo())


class TestT11MockResponse:
    def test_top_level_fields_match_section_5_1(self) -> None:
        mock = load_mock()
        assert set(mock) == {
            "run_id",
            "status",
            "scenario_id",
            "summary",
            "dispatch_hours",
            "baseline_summary",
            "explanations",
            "warnings",
            "persistence",
        }

    def test_status_is_valid_enum(self) -> None:
        assert load_mock()["status"] in {"optimal", "emergency_plan", "failed"}

    def test_summary_matches_section_5_2(self) -> None:
        expected = {
            "total_demand_kwh",
            "total_served_kwh",
            "total_unserved_kwh",
            "p1_unserved_kwh",
            "p2_unserved_kwh",
            "p3_unserved_kwh",
            "p4_unserved_kwh",
            "diesel_energy_kwh",
            "diesel_fuel_l",
            "fuel_cost",
            "co2_kg",
            "renewable_available_kwh",
            "renewable_used_kwh",
            "renewable_curtailment_kwh",
            "renewable_share_percent",
            "p1_reliability_percent",
            "final_battery_energy_kwh",
            "reserve_shortfall_kwh",
        }
        assert set(load_mock()["summary"]) == expected

    def test_dispatch_hours_matches_section_5_3(self) -> None:
        expected = {
            "hour_index",
            "timestamp",
            "solar_available_kwh",
            "solar_used_kwh",
            "wind_available_kwh",
            "wind_used_kwh",
            "battery_energy_start_kwh",
            "battery_charge_kwh",
            "battery_discharge_kwh",
            "battery_energy_end_kwh",
            "diesel_generation_kwh",
            "p1_demand_kwh",
            "p2_demand_kwh",
            "p3_demand_kwh",
            "p4_demand_kwh",
            "p1_served_kwh",
            "p2_served_kwh",
            "p3_served_kwh",
            "p4_served_kwh",
            "p1_unserved_kwh",
            "p2_unserved_kwh",
            "p3_unserved_kwh",
            "p4_unserved_kwh",
            "renewable_curtailment_kwh",
            "fuel_cost",
            "co2_kg",
        }
        mock = load_mock()
        assert len(mock["dispatch_hours"]) == 24
        for hour in mock["dispatch_hours"]:
            assert set(hour) == expected

    def test_baseline_summary_has_same_structure_as_summary(self) -> None:
        mock = load_mock()
        assert set(mock["baseline_summary"]) == set(mock["summary"])

    def test_explanations_match_section_5_4(self) -> None:
        mock = load_mock()
        assert mock["explanations"]
        for explanation in mock["explanations"]:
            assert set(explanation) == {"code", "severity", "hour_index", "message", "evidence"}
            assert explanation["severity"] in {"info", "warning", "critical"}
            assert isinstance(explanation["hour_index"], int | type(None))

    def test_warning_codes_match_section_5_5(self) -> None:
        known = {
            "P1_UNSERVED",
            "RESERVE_SHORTFALL",
            "RENEWABLE_CURTAILMENT",
            "DATABASE_SAVE_FAILED",
            "FALLBACK_DATA_USED",
        }
        mock = load_mock()
        assert set(mock["warnings"]) <= known

    def test_persistence_has_saved_flag(self) -> None:
        assert "saved" in load_mock()["persistence"]