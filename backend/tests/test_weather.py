import pytest

from app.services.weather_service import (
    IncompleteWeatherError,
    calculate_solar_available_kwh,
    calculate_wind_available_kwh,
    transform_weather_to_energy,
)

DATE = "2026-09-12"
TZ = "Asia/Kolkata"


def make_weather(times: list[str], irradiance: list[float] | None = None) -> dict:
    n = len(times)
    return {
        "timezone": TZ,
        "latitude": 23.0225,
        "longitude": 72.5714,
        "date": DATE,
        "hourly": {
            "time": times,
            "global_tilted_irradiance": irradiance
            if irradiance is not None
            else [0.0] * n,
            "wind_speed_10m": [5.0] * n,
            "cloud_cover": [25.0] * n,
        },
    }


def local_day() -> dict:
    return make_weather([f"2026-09-12T{i:02d}:00" for i in range(24)])


def test_solar_doc_example() -> None:
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
    expected = 10.0 * (5**3 - 3**3) / (12**3 - 3**3)
    assert calculate_wind_available_kwh(5.0, 10.0) == pytest.approx(expected)


# ---- Test 1: exact local-day mapping (00:00 -> 0, 16:00 -> 16, 23:00 -> 23) ----

def test_local_day_maps_hour_index_from_timestamp() -> None:
    hours = transform_weather_to_energy(
        local_day(), DATE, TZ, 60.0, 10.0, 0.85
    )
    assert len(hours) == 24
    by_index = {hour.hour_index: hour for hour in hours}
    assert by_index[0].timestamp.startswith("2026-09-12T00:00")
    assert by_index[16].timestamp.startswith("2026-09-12T16:00")
    assert by_index[23].timestamp.startswith("2026-09-12T23:00")
    assert [hour.hour_index for hour in hours] == list(range(24))


# ---- Test 2: rolling 16:00 window must NOT be relabelled as hour 0 ----

def test_rolling_window_is_not_relabelled() -> None:
    times = [f"2026-09-12T{i:02d}:00" for i in range(16, 24)]
    times += [f"2026-09-13T{i:02d}:00" for i in range(24)]
    times = times[:24]
    rolling = make_weather(times)
    with pytest.raises(IncompleteWeatherError):
        transform_weather_to_energy(rolling, DATE, TZ, 60.0, 10.0, 0.85)


# ---- Test 3: unordered timestamps are sorted to 0..23 ----

def test_unordered_timestamps_are_sorted() -> None:
    times = [f"2026-09-12T{i:02d}:00" for i in range(24)]
    shuffled = times[::-1]
    hours = transform_weather_to_energy(
        make_weather(shuffled), DATE, TZ, 60.0, 10.0, 0.85
    )
    assert [hour.hour_index for hour in hours] == list(range(24))


# ---- Test 4: missing hour is rejected ----

def test_missing_hour_is_rejected() -> None:
    times = [f"2026-09-12T{i:02d}:00" for i in range(24) if i != 13]
    with pytest.raises(IncompleteWeatherError):
        transform_weather_to_energy(
            make_weather(times), DATE, TZ, 60.0, 10.0, 0.85
        )


# ---- Test 5: duplicate hour is rejected ----

def test_duplicate_hour_is_rejected() -> None:
    times = [f"2026-09-12T{i:02d}:00" for i in range(24)]
    times[5] = times[4]
    with pytest.raises(IncompleteWeatherError):
        transform_weather_to_energy(
            make_weather(times), DATE, TZ, 60.0, 10.0, 0.85
        )


# ---- Test 6: end-to-end alignment (high solar at 12:00, zero at 00:00) ----

def test_end_to_end_alignment() -> None:
    irradiance = [0.0] * 24
    irradiance[12] = 1000.0
    weather = make_weather(
        [f"2026-09-12T{i:02d}:00" for i in range(24)], irradiance=irradiance
    )
    hours = transform_weather_to_energy(weather, DATE, TZ, 60.0, 10.0, 0.85)
    by_index = {hour.hour_index: hour for hour in hours}
    # 1000 W/m2 * 60 kW * 0.85 / 1000 = 51 kWh (clamped to 60)
    assert by_index[12].solar_available_kwh == pytest.approx(51.0, abs=0.1)
    assert by_index[0].solar_available_kwh == pytest.approx(0.0, abs=1e-6)


def test_transform_preserves_source_timestamp() -> None:
    hours = transform_weather_to_energy(local_day(), DATE, TZ, 60.0, 10.0, 0.85)
    assert hours[16].timestamp == "2026-09-12T16:00:00+05:30"