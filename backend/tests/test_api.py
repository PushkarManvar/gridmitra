from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _demo_scenario() -> dict:
    scenario_response = client.get("/api/v1/scenarios/demo")
    assert scenario_response.status_code == 200
    return scenario_response.json()


async def _successful_save(_request, _response) -> None:
    return None


def _assert_validation_error(response, path=None) -> None:
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["message"] == "The optimization request is invalid."
    assert isinstance(body["error"]["fields"], list)
    if path is not None:
        assert any(field["path"] == path for field in body["error"]["fields"])


def test_demo_round_trip(monkeypatch) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    scenario = _demo_scenario()

    optimization_response = client.post("/api/v1/optimize", json=scenario)
    assert optimization_response.status_code == 200
    payload = optimization_response.json()
    assert payload["status"] in ("optimal", "emergency_plan")
    assert len(payload["dispatch_hours"]) == 24
    assert payload["scenario_id"] == scenario["scenario_id"]
    assert payload["persistence"]["saved"] is True
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
    scenario = _demo_scenario()
    scenario["hours"] = scenario["hours"][:-1]
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_extra_hours() -> None:
    scenario = _demo_scenario()
    scenario["hours"].append(dict(scenario["hours"][0], hour_index=24))
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_duplicate_hour_index() -> None:
    scenario = _demo_scenario()
    scenario["hours"][1]["hour_index"] = scenario["hours"][0]["hour_index"]
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_negative_demand() -> None:
    scenario = _demo_scenario()
    scenario["hours"][0]["p1_demand_kwh"] = -1
    response = client.post("/api/v1/optimize", json=scenario)
    _assert_validation_error(response, path="hours.0.p1_demand_kwh")


def test_rejects_negative_renewable_availability() -> None:
    scenario = _demo_scenario()
    scenario["hours"][0]["solar_available_kwh"] = -1
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_invalid_efficiency() -> None:
    scenario = _demo_scenario()
    scenario["assets"]["battery"]["charge_efficiency"] = 1.5
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.battery.charge_efficiency",
    )


def test_rejects_invalid_scenario_type() -> None:
    scenario = _demo_scenario()
    scenario["scenario_type"] = "not_a_scenario"
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="scenario_type",
    )


def test_rejects_invalid_interval_hours() -> None:
    scenario = _demo_scenario()
    scenario["site"]["interval_hours"] = 2
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_battery_initial_outside_bounds() -> None:
    scenario = _demo_scenario()
    scenario["assets"]["battery"]["initial_energy_kwh"] = -5
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.battery.initial_energy_kwh",
    )


def test_rejects_battery_minimum_above_maximum() -> None:
    scenario = _demo_scenario()
    scenario["assets"]["battery"]["minimum_energy_kwh"] = 200
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_reserve_above_maximum_energy() -> None:
    scenario = _demo_scenario()
    scenario["assets"]["battery"]["terminal_reserve_target_kwh"] = 500
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_negative_diesel_capacity() -> None:
    scenario = _demo_scenario()
    scenario["assets"]["diesel"]["maximum_kw"] = -1
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.diesel.maximum_kw",
    )


def test_rejects_negative_fuel_price() -> None:
    scenario = _demo_scenario()
    scenario["assets"]["diesel"]["fuel_price_per_l"] = -1
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.diesel.fuel_price_per_l",
    )


def test_database_failure_returns_calculated_result_with_warning(monkeypatch) -> None:
    async def failing_save(_request, _response) -> None:
        raise RuntimeError("database unavailable")

    monkeypatch.setattr("app.services.persistence.save_run", failing_save)
    scenario = _demo_scenario()
    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["dispatch_hours"]) == 24
    assert payload["persistence"]["saved"] is False
    assert payload["persistence"]["message"] == "DATABASE_SAVE_FAILED"
    assert any(
        warning["code"] == "DATABASE_SAVE_FAILED" for warning in payload["warnings"]
    )


def _dispatch_rows(text: str) -> list[str]:
    return [line for line in text.splitlines() if line.startswith("dispatch,")]


def test_csv_export_contains_all_hours_and_summary(monkeypatch) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    result = client.post("/api/v1/optimize", json=_demo_scenario()).json()

    csv_response = client.post("/api/v1/optimize/export", json=result)
    assert csv_response.status_code == 200
    assert csv_response.headers["content-type"].startswith("text/csv")
    assert f"attachment; filename=\"{result['run_id']}.csv\"" in csv_response.headers[
        "content-disposition"
    ]

    text = csv_response.text
    dispatch_rows = _dispatch_rows(text)
    assert len(dispatch_rows) == 25  # header row + 24 hourly rows
    hour_indices = [line.split(",")[1] for line in dispatch_rows[1:]]
    assert hour_indices == [str(index) for index in range(24)]
    assert "total_demand_kwh" in text
    assert "renewable_share_percent" in text
    assert "p1_reliability_percent" in text


def test_csv_export_works_after_persistence_failure(monkeypatch) -> None:
    async def failing_save(_request, _response) -> None:
        raise RuntimeError("database unavailable")

    monkeypatch.setattr("app.services.persistence.save_run", failing_save)
    result = client.post("/api/v1/optimize", json=_demo_scenario()).json()
    assert result["persistence"]["saved"] is False

    csv_response = client.post("/api/v1/optimize/export", json=result)
    assert csv_response.status_code == 200
    assert len(_dispatch_rows(csv_response.text)) == 25
    assert "DATABASE_SAVE_FAILED" in csv_response.text


def test_csv_export_accepts_emergency_plan(monkeypatch) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    scenario = _demo_scenario()
    for hour in scenario["hours"]:
        hour["solar_available_kwh"] = 0
        hour["wind_available_kwh"] = 0
        hour["p1_demand_kwh"] = 100
    result = client.post("/api/v1/optimize", json=scenario).json()
    assert result["status"] == "emergency_plan"
    csv_response = client.post("/api/v1/optimize/export", json=result)
    assert csv_response.status_code == 200
    assert "P1_UNSERVED" in csv_response.text