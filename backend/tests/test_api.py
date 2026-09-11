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
    assert payload["status"] == "optimal"
    assert len(payload["hours"]) == 24


def test_rejects_incomplete_day() -> None:
    scenario = client.get("/api/v1/scenarios/demo").json()
    scenario["hours"] = scenario["hours"][:-1]

    response = client.post("/api/v1/optimize", json=scenario)

    assert response.status_code == 422
