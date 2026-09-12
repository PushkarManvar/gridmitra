"""Open-Meteo live weather integration.

The optimizer never calls this service directly. FastAPI fetches weather,
converts it into solar/wind availability, and hands the resulting 24-hour
records to the existing validation and optimization flow. Live weather is
optional; prepared data remains the default judge path.
"""

import httpx

from app.schemas.weather import WeatherForecastResponse, WeatherHour

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

DEFAULT_SOLAR_DERATING_FACTOR = 0.85

_CACHE: dict[tuple[float, float], dict] = {}


class WeatherServiceError(Exception):
    pass


async def fetch_weather_forecast(
    latitude: float,
    longitude: float,
    panel_tilt_degrees: float,
    panel_azimuth_degrees: float,
) -> dict:
    """Request a 24-hour forecast from Open-Meteo and validate its shape.

    Raises WeatherServiceError when the provider is unreachable or returns an
    incomplete response.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join(
            ["global_tilted_irradiance", "wind_speed_10m", "cloud_cover"]
        ),
        "forecast_hours": 24,
        "timezone": "auto",
        "wind_speed_unit": "ms",
        "tilt": panel_tilt_degrees,
        "azimuth": panel_azimuth_degrees,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(OPEN_METEO_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise WeatherServiceError("Live weather forecast is currently unavailable.") from exc

    hourly = data.get("hourly", {})
    required_fields = ["time", "global_tilted_irradiance", "wind_speed_10m", "cloud_cover"]
    for field in required_fields:
        values = hourly.get(field)
        if not isinstance(values, list) or len(values) != 24:
            raise WeatherServiceError(f"Weather response has invalid field: {field}")
        if any(value is None for value in values):
            raise WeatherServiceError(f"Weather response contains missing values: {field}")

    return {
        "timezone": data.get("timezone"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "hourly": hourly,
    }


def calculate_solar_available_kwh(
    irradiance_w_per_m2: float,
    solar_capacity_kw: float,
    derating_factor: float,
    interval_hours: float = 1.0,
) -> float:
    """Convert tilted-plane irradiance (W/m2) into usable solar energy.

    The derating factor is a documented demo assumption (0.85) approximating
    temperature, inverter, dust, wiring and panel-mismatch losses.
    """
    irradiance_ratio = max(0.0, irradiance_w_per_m2) / 1000.0
    energy_kwh = solar_capacity_kw * irradiance_ratio * derating_factor * interval_hours
    maximum_energy = solar_capacity_kw * interval_hours
    return min(max(energy_kwh, 0.0), maximum_energy)


def calculate_wind_available_kwh(
    wind_speed_mps: float,
    wind_capacity_kw: float,
    interval_hours: float = 1.0,
    cut_in_speed: float = 3.0,
    rated_speed: float = 12.0,
    cut_out_speed: float = 25.0,
) -> float:
    """Estimate wind output from a simplified turbine power curve.

    Prototype assumption; production would use the manufacturer's curve.
    """
    speed = max(0.0, wind_speed_mps)
    if speed < cut_in_speed or speed >= cut_out_speed:
        power_kw = 0.0
    elif speed < rated_speed:
        power_fraction = (speed**3 - cut_in_speed**3) / (
            rated_speed**3 - cut_in_speed**3
        )
        power_kw = wind_capacity_kw * power_fraction
    else:
        power_kw = wind_capacity_kw
    return max(0.0, power_kw * interval_hours)


def transform_weather_to_energy(
    weather: dict,
    solar_capacity_kw: float,
    wind_capacity_kw: float,
    solar_derating_factor: float,
) -> list[WeatherHour]:
    """Build the 24-hour solar/wind availability records used by the optimizer."""
    hourly = weather["hourly"]
    hours: list[WeatherHour] = []
    for hour_index in range(24):
        solar_kwh = calculate_solar_available_kwh(
            irradiance_w_per_m2=hourly["global_tilted_irradiance"][hour_index],
            solar_capacity_kw=solar_capacity_kw,
            derating_factor=solar_derating_factor,
        )
        wind_kwh = calculate_wind_available_kwh(
            wind_speed_mps=hourly["wind_speed_10m"][hour_index],
            wind_capacity_kw=wind_capacity_kw,
        )
        hours.append(
            WeatherHour(
                hour_index=hour_index,
                timestamp=hourly["time"][hour_index],
                solar_available_kwh=round(solar_kwh, 3),
                wind_available_kwh=round(wind_kwh, 3),
                cloud_cover_percent=round(float(hourly["cloud_cover"][hour_index]), 1),
            )
        )
    return hours


async def get_weather_forecast(
    latitude: float,
    longitude: float,
    solar_capacity_kw: float,
    wind_capacity_kw: float,
    panel_tilt_degrees: float,
    panel_azimuth_degrees: float,
    solar_derating_factor: float,
) -> WeatherForecastResponse:
    """Live forecast with a graceful last-successful-response cache fallback.

    Order: live Open-Meteo -> cached last success -> raise (endpoint returns
    WEATHER_UNAVAILABLE; the frontend falls back to prepared data).
    """
    cache_key = (round(latitude, 4), round(longitude, 4))
    try:
        weather = await fetch_weather_forecast(
            latitude=latitude,
            longitude=longitude,
            panel_tilt_degrees=panel_tilt_degrees,
            panel_azimuth_degrees=panel_azimuth_degrees,
        )
    except WeatherServiceError:
        cached = _CACHE.get(cache_key)
        if cached is None:
            raise
        return WeatherForecastResponse(
            source="cached",
            provider="open_meteo",
            timezone=cached["timezone"],
            hours=transform_weather_to_energy(
                weather=cached,
                solar_capacity_kw=solar_capacity_kw,
                wind_capacity_kw=wind_capacity_kw,
                solar_derating_factor=solar_derating_factor,
            ),
            warnings=[
                {
                    "code": "FALLBACK_DATA_USED",
                    "severity": "warning",
                    "message": (
                        "Live weather was unavailable; the last successful "
                        "forecast is being used."
                    ),
                }
            ],
        )

    _CACHE[cache_key] = weather
    return WeatherForecastResponse(
        source="live",
        provider="open_meteo",
        timezone=weather["timezone"],
        hours=transform_weather_to_energy(
            weather=weather,
            solar_capacity_kw=solar_capacity_kw,
            wind_capacity_kw=wind_capacity_kw,
            solar_derating_factor=solar_derating_factor,
        ),
    )