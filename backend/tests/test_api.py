



def _demo_scenario(client) -> dict:
    scenario_response = client.get("/api/v1/scenarios/demo")
    assert scenario_response.status_code == 200
    return scenario_response.json()


async def _successful_save(_request, _response, owner_id=None) -> None:
    return None


def _assert_validation_error(response, path=None) -> None:
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["message"] == "The optimization request is invalid."
    assert isinstance(body["error"]["fields"], list)
    if path is not None:
        assert any(field["path"] == path for field in body["error"]["fields"])


def test_demo_round_trip(monkeypatch, client) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    scenario = _demo_scenario(client)

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


def test_health_distinguishes_api_solver_database(client) -> None:
    payload = client.get("/api/v1/health").json()
    assert set(payload) == {"api", "solver", "database"}


def test_rejects_incomplete_day(client) -> None:
    scenario = _demo_scenario(client)
    scenario["hours"] = scenario["hours"][:-1]
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_extra_hours(client) -> None:
    scenario = _demo_scenario(client)
    scenario["hours"].append(dict(scenario["hours"][0], hour_index=24))
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_duplicate_hour_index(client) -> None:
    scenario = _demo_scenario(client)
    scenario["hours"][1]["hour_index"] = scenario["hours"][0]["hour_index"]
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_negative_demand(client) -> None:
    scenario = _demo_scenario(client)
    scenario["hours"][0]["p1_demand_kwh"] = -1
    response = client.post("/api/v1/optimize", json=scenario)
    _assert_validation_error(response, path="hours.0.p1_demand_kwh")


def test_rejects_negative_renewable_availability(client) -> None:
    scenario = _demo_scenario(client)
    scenario["hours"][0]["solar_available_kwh"] = -1
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_invalid_efficiency(client) -> None:
    scenario = _demo_scenario(client)
    scenario["assets"]["battery"]["charge_efficiency"] = 1.5
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.battery.charge_efficiency",
    )


def test_rejects_invalid_scenario_type(client) -> None:
    scenario = _demo_scenario(client)
    scenario["scenario_type"] = "not_a_scenario"
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="scenario_type",
    )


def test_rejects_invalid_interval_hours(client) -> None:
    scenario = _demo_scenario(client)
    scenario["site"]["interval_hours"] = 2
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_battery_initial_outside_bounds(client) -> None:
    scenario = _demo_scenario(client)
    scenario["assets"]["battery"]["initial_energy_kwh"] = -5
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.battery.initial_energy_kwh",
    )


def test_rejects_battery_minimum_above_maximum(client) -> None:
    scenario = _demo_scenario(client)
    scenario["assets"]["battery"]["minimum_energy_kwh"] = 200
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_reserve_above_maximum_energy(client) -> None:
    scenario = _demo_scenario(client)
    scenario["assets"]["battery"]["terminal_reserve_target_kwh"] = 500
    _assert_validation_error(client.post("/api/v1/optimize", json=scenario))


def test_rejects_negative_diesel_capacity(client) -> None:
    scenario = _demo_scenario(client)
    scenario["assets"]["diesel"]["maximum_kw"] = -1
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.diesel.maximum_kw",
    )


def test_rejects_negative_fuel_price(client) -> None:
    scenario = _demo_scenario(client)
    scenario["assets"]["diesel"]["fuel_price_per_l"] = -1
    _assert_validation_error(
        client.post("/api/v1/optimize", json=scenario),
        path="assets.diesel.fuel_price_per_l",
    )


def test_database_failure_returns_calculated_result_with_warning(monkeypatch, client) -> None:
    async def failing_save(_request, _response) -> None:
        raise RuntimeError("database unavailable")

    monkeypatch.setattr("app.services.persistence.save_run", failing_save)
    scenario = _demo_scenario(client)
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


def test_csv_export_contains_all_hours_and_summary(monkeypatch, client) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    result = client.post("/api/v1/optimize", json=_demo_scenario(client)).json()

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


def test_csv_export_works_after_persistence_failure(monkeypatch, client) -> None:
    async def failing_save(_request, _response) -> None:
        raise RuntimeError("database unavailable")

    monkeypatch.setattr("app.services.persistence.save_run", failing_save)
    result = client.post("/api/v1/optimize", json=_demo_scenario(client)).json()
    assert result["persistence"]["saved"] is False

    csv_response = client.post("/api/v1/optimize/export", json=result)
    assert csv_response.status_code == 200
    assert len(_dispatch_rows(csv_response.text)) == 25
    assert "DATABASE_SAVE_FAILED" in csv_response.text


def test_csv_export_accepts_emergency_plan(monkeypatch, client) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    scenario = _demo_scenario(client)
    for hour in scenario["hours"]:
        hour["solar_available_kwh"] = 0
        hour["wind_available_kwh"] = 0
        hour["p1_demand_kwh"] = 100
    result = client.post("/api/v1/optimize", json=scenario).json()
    assert result["status"] == "emergency_plan"
    csv_response = client.post("/api/v1/optimize/export", json=result)
    assert csv_response.status_code == 200
    assert "P1_UNSERVED" in csv_response.text


def test_p3_p4_shedding_returns_emergency_with_warnings(monkeypatch, client) -> None:
    monkeypatch.setattr("app.services.persistence.save_run", _successful_save)
    scenario = _demo_scenario(client)
    for hour in scenario["hours"]:
        hour["solar_available_kwh"] = 0
        hour["wind_available_kwh"] = 0
        hour["p1_demand_kwh"] = 0
        hour["p2_demand_kwh"] = 0
        hour["p3_demand_kwh"] = 10
        hour["p4_demand_kwh"] = 10
    battery = scenario["assets"]["battery"]
    battery["initial_energy_kwh"] = battery["minimum_energy_kwh"]
    battery["terminal_reserve_target_kwh"] = battery["minimum_energy_kwh"]
    scenario["assets"]["diesel"]["maximum_kw"] = 5

    response = client.post("/api/v1/optimize", json=scenario)
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "emergency_plan"
    codes = {warning["code"] for warning in payload["warnings"]}
    assert {"P3_REDUCED", "P4_REDUCED"} <= codes
    assert "P1_UNSERVED" not in codes
    explanation_codes = {explanation["code"] for explanation in payload["explanations"]}
    assert {"P3_REDUCED", "P4_REDUCED"} <= explanation_codes
    # serialization round-trip: export accepts and carries the new warning codes
    csv_response = client.post("/api/v1/optimize/export", json=payload)
    assert csv_response.status_code == 200
    assert "P3_REDUCED" in csv_response.text
    assert "P4_REDUCED" in csv_response.text
