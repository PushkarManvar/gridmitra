import pytest

from app.services.weather_service import (
    calculate_solar_available_kwh,
    calculate_wind_available_kwh,
    transform_weather_to_energy,
)

SAMPLE_WEATHER = {
    "timezone": "Asia/Kolkata",
    "latitude": 23.0225,
    "longitude": 72.5714,
    "hourly": {
        "time": [f"2026-09-12T{i:02d}:00" for i in range(24)],
        "global_tilted_irradiance": [
            (800.0 if 8 <= i <= 17 else 0.0) for i in range(24)
        ],
        "wind_speed_10m": [
            (5.0 if i < 12 else 15.0) for i in range(24)
        ],
        "cloud_cover": [25.0] * 24,
    },
}


def test_solar_doc_example() -> None:
    # 60 kW capacity, 800 W/m2 GTI, 0.85 derating, 1h -> 40.8 kWh
    assert calculate_solar_available_kwh(800.0, 60.0, 0.85) == pytest.approx(40.8)


def test_solar_clamped_to_capacity_and_non_negative() -> None:
    assert calculate_solar_available_kwh(2000.0, 60.0, 0.85) == pytest.approx(60.0)
    assert calculate_solar_available_kwh(-100.0, 60.0, 0.85) == pytest.approx(0.0)


def test_wind_below_cut_in_is_zero() -> None:
    assert calculate_wind_available_kwh(2.0, 10.0) == pytest.approx(0.0)


def test_wind_above_cut_out_is_zero() -> None:
    assert calculate_wind_available_kwh(30.0, 10.0) == pytest.approx(0.0)


def test_wind_at_rated_speed_is_capacity() -> None:
    assert calculate_wind_available_kwh(12.0, 10.0) == pytest.approx(10.0)


def test_wind_part_load_between_cut_in_and_rated() -> None:
    # 5 m/s, cut-in 3, rated 12: fraction = (125-27)/(1728-27) ~ 0.058
    expected = 10.0 * (5**3 - 3**3) / (12**3 - 3**3)
    assert calculate_wind_available_kwh(5.0, 10.0) == pytest.approx(expected)


def test_transform_weather_to_energy() -> None:
    hours = transform_weather_to_energy(
        SAMPLE_WEATHER,
        solar_capacity_kw=60.0,
        wind_capacity_kw=10.0,
        solar_derating_factor=0.85,
    )
    assert len(hours) == 24
    assert hours[0].hour_index == 0
    assert hours[10].solar_available_kwh == pytest.approx(40.8)
    assert hours[0].solar_available_kwh == 0.0
    assert hours[0].wind_available_kwh > 0
    assert hours[12].wind_available_kwh == pytest.approx(10.0)
    assert hours[0].cloud_cover_percent == 25.0
    assert hours[0].timestamp == "2026-09-12T00:00"