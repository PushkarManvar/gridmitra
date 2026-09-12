from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _demo_scenario() -> dict:
    response = client.get("/api/v1/scenarios/demo")
    assert response.status_code == 200
    return response.json()


def test_optimize_persists_run_and_list_returns_it() -> None:
    scenario = _demo_scenario()
    optimize = client.post("/api/v1/optimize", json=scenario)
    assert optimize.status_code == 200
    payload = optimize.json()
    assert payload["persistence"]["saved"] is True

    listed = client.get("/api/v1/runs").json()["runs"]
    assert any(run["run_id"] == payload["run_id"] for run in listed)


def test_get_run_round_trip() -> None:
    scenario = _demo_scenario()
    payload = client.post("/api/v1/optimize", json=scenario).json()

    detail = client.get(f"/api/v1/runs/{payload['run_id']}")
    assert detail.status_code == 200
    body = detail.json()
    assert body["run_id"] == payload["run_id"]
    assert body["status"] == payload["status"]
    assert body["summary"] == payload["summary"]
    assert body["baseline_summary"] == payload["baseline_summary"]
    assert len(body["dispatch_hours"]) == 24
    assert body["dispatch_hours"][0]["hour_index"] == 0
    assert len(body["explanations"]) == len(payload["explanations"])
    # The immutable input snapshot lets a historical viewer render the run with
    # the exact inputs it was computed from (A5), not the current scenario.
    assert body["input_snapshot"]["scenario_id"] == scenario["scenario_id"]
    assert len(body["input_snapshot"]["hours"]) == 24


def test_unknown_run_returns_404() -> None:
    response = client.get("/api/v1/runs/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    body = response.json()
    assert body["detail"]["error"]["code"] == "RUN_NOT_FOUND"