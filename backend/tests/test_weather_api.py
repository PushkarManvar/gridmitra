import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.weather_service import _CACHE, WeatherServiceError
from tests.test_weather import SAMPLE_WEATHER

client = TestClient(app)

WEATHER_PARAMS = {
    "latitude": 23.0225,
    "longitude": 72.5714,
    "solar_capacity_kw": 60,
    "wind_capacity_kw": 10,
    "panel_tilt_degrees": 23,
    "panel_azimuth_degrees": 0,
    "solar_derating_factor": 0.85,
}


def test_weather_forecast_live(monkeypatch) -> None:
    async def fake_fetch(latitude, longitude, panel_tilt_degrees, panel_azimuth_degrees):
        return SAMPLE_WEATHER

    monkeypatch.setattr("app.services.weather_service.fetch_weather_forecast", fake_fetch)

    response = client.get("/api/v1/weather/forecast", params=WEATHER_PARAMS)
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "live"
    assert payload["provider"] == "open_meteo"
    assert len(payload["hours"]) == 24
    assert payload["hours"][10]["solar_available_kwh"] == pytest.approx(40.8)
    assert payload["warnings"] == []


def test_weather_forecast_unavailable_returns_503(monkeypatch) -> None:
    async def failing_fetch(latitude, longitude, panel_tilt_degrees, panel_azimuth_degrees):
        raise WeatherServiceError("down")

    _CACHE.clear()
    monkeypatch.setattr("app.services.weather_service.fetch_weather_forecast", failing_fetch)

    response = client.get("/api/v1/weather/forecast", params=WEATHER_PARAMS)
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "WEATHER_UNAVAILABLE"


def test_weather_forecast_rejects_invalid_latitude() -> None:
    params = {**WEATHER_PARAMS, "latitude": 999}
    response = client.get("/api/v1/weather/forecast", params=params)
    assert response.status_code == 422