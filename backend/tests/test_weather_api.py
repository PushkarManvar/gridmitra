from app.services.weather_service import _CACHE, WeatherServiceError
from tests.test_weather import local_day, make_weather

WEATHER_PARAMS = {
    "latitude": 23.0225,
    "longitude": 72.5714,
    "solar_capacity_kw": 60,
    "wind_capacity_kw": 10,
    "panel_tilt_degrees": 23,
    "panel_azimuth_degrees": 0,
    "solar_derating_factor": 0.85,
    "date": "2026-09-12",
    "timezone": "Asia/Kolkata",
}


def test_weather_forecast_live_aligns_hours(monkeypatch, client) -> None:
    async def fake_fetch(**kwargs):
        return local_day()

    monkeypatch.setattr("app.services.weather_service.fetch_weather_forecast", fake_fetch)

    response = client.get("/api/v1/weather/forecast", params=WEATHER_PARAMS)
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "live"
    assert len(payload["hours"]) == 24
    # 16:00 local must map to hour_index 16, never 0
    assert payload["hours"][16]["hour_index"] == 16
    assert payload["hours"][16]["timestamp"].startswith("2026-09-12T16:00")
    assert [h["hour_index"] for h in payload["hours"]] == list(range(24))


def test_weather_forecast_rolling_window_returns_prepared_fallback(monkeypatch, client) -> None:
    times = [f"2026-09-12T{i:02d}:00" for i in range(16, 24)]
    times += [f"2026-09-13T{i:02d}:00" for i in range(24)]
    rolling = make_weather(times[:24])

    async def fake_fetch(**kwargs):
        return rolling

    monkeypatch.setattr("app.services.weather_service.fetch_weather_forecast", fake_fetch)
    _CACHE.clear()

    response = client.get("/api/v1/weather/forecast", params=WEATHER_PARAMS)
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "prepared_fallback"
    assert payload["hours"] == []
    assert any(w["code"] == "LIVE_WEATHER_INCOMPLETE" for w in payload["warnings"])


def test_weather_forecast_missing_hour_returns_prepared_fallback(monkeypatch, client) -> None:
    times = [f"2026-09-12T{i:02d}:00" for i in range(24) if i != 7]
    incomplete = make_weather(times)

    async def fake_fetch(**kwargs):
        return incomplete

    monkeypatch.setattr("app.services.weather_service.fetch_weather_forecast", fake_fetch)
    _CACHE.clear()

    response = client.get("/api/v1/weather/forecast", params=WEATHER_PARAMS)
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "prepared_fallback"
    assert any(w["code"] == "LIVE_WEATHER_INCOMPLETE" for w in payload["warnings"])


def test_weather_forecast_unavailable_returns_503(monkeypatch, client) -> None:
    async def failing_fetch(**kwargs):
        raise WeatherServiceError("down")

    _CACHE.clear()
    monkeypatch.setattr("app.services.weather_service.fetch_weather_forecast", failing_fetch)

    response = client.get("/api/v1/weather/forecast", params=WEATHER_PARAMS)
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "WEATHER_UNAVAILABLE"


def test_weather_forecast_rejects_invalid_latitude(client) -> None:
    params = {**WEATHER_PARAMS, "latitude": 999}
    response = client.get("/api/v1/weather/forecast", params=params)
    assert response.status_code == 422