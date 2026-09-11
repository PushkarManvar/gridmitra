from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_demo_round_trip() -> None:
    scenario_response = client.get("/api/v1/scenarios/demo")
    assert scenario_response.status_code == 200

    optimization_response = client.post(
        "/api/v1/optimize",
        json=scenario_response.json(),
    )
    assert optimization_response.status_code == 200
    payload = optimization_response.json()
    assert payload["status"] in ("optimal", "emergency_plan")
    assert len(payload["dispatch_hours"]) == 24
    assert payload["scenario_id"] == scenario_response.json()["scenario_id"]
    assert set(payload) == {
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


def test_health_distinguishes_api_solver_database() -> None:
    payload = client.get("/api/v1/health").json()
    assert set(payload) == {"api", "solver", "database"}


def test_rejects_incomplete_day() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["hours"] = scenario["hours"][:-1]
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 422


def test_rejects_negative_demand() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["hours"][0]["p1_demand_kwh"] = -1
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 422


def test_rejects_negative_renewable_availability() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["hours"][0]["solar_available_kwh"] = -1
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 422


def test_rejects_invalid_scenario_type() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["scenario_type"] = "not_a_scenario"
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 422


def test_rejects_invalid_interval_hours() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["site"]["interval_hours"] = 2
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 422


def test_rejects_battery_initial_outside_bounds() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["assets"]["battery"]["initial_energy_kwh"] = -5
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 422