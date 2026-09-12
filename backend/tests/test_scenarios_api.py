import uuid


def _demo(client) -> dict:
    return client.get("/api/v1/scenarios/demo").json()


def _unique(name: str) -> str:
    return f"{name} {uuid.uuid4().hex[:6]}"


def test_save_and_list_scenario_version(client) -> None:
    payload = _demo(client)
    name = _unique("My Custom Community")
    payload["scenario_name"] = name

    created = client.post("/api/v1/scenarios", json=payload)
    assert created.status_code == 201
    body = created.json()
    assert body["name"] == name
    assert body["version"] == 1

    # saving again bumps the version for the same (owner, name)
    created2 = client.post("/api/v1/scenarios", json=payload)
    assert created2.status_code == 201
    assert created2.json()["version"] == 2

    listed = client.get("/api/v1/scenarios").json()["scenarios"]
    mine = [s for s in listed if s["name"] == name]
    assert len(mine) == 1
    assert mine[0]["version"] == 2


def test_load_latest_scenario_version(client) -> None:
    payload = _demo(client)
    name = _unique("Editor Scenario")
    payload["scenario_name"] = name
    client.post("/api/v1/scenarios", json=payload)

    loaded = client.get(f"/api/v1/scenarios/{name}/latest")
    assert loaded.status_code == 200
    body = loaded.json()
    assert body["payload"]["scenario_name"] == name
    assert len(body["payload"]["hours"]) == 24


def test_unknown_scenario_returns_404(client) -> None:
    response = client.get("/api/v1/scenarios/does-not-exist/latest")
    assert response.status_code == 404
    assert response.json()["detail"]["error"]["code"] == "SCENARIO_NOT_FOUND"


def test_saved_scenario_can_be_optimized(client) -> None:
    payload = _demo(client)
    name = _unique("Optimizable Scenario")
    payload["scenario_name"] = name
    client.post("/api/v1/scenarios", json=payload)

    loaded = client.get(f"/api/v1/scenarios/{name}/latest").json()["payload"]
    optimize = client.post("/api/v1/optimize", json=loaded)
    assert optimize.status_code == 200
    assert optimize.json()["status"] in ("optimal", "emergency_plan")