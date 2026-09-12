"""Open-Meteo live weather integration with local-calendar-day alignment.

The optimizer never calls this service directly. FastAPI fetches weather for the
exact local scenario date, normalizes every record to its real local
``hour_index`` (00:00 -> 0 ... 23:00 -> 23), validates that all 24 hours are
present, and hands the aligned records to the existing validation and
optimization flow. Live weather is optional; prepared data remains the default
judge path.

P0 fix: hour_index is derived from the returned local timestamp, never from the
enumerate position, so a rolling 16:00-window can never be relabelled as 00:00.
"""

import datetime
import logging
from zoneinfo import ZoneInfo

import httpx

from app.schemas.weather import WeatherForecastResponse, WeatherHour

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

DEFAULT_SOLAR_DERATING_FACTOR = 0.85
DEFAULT_TIMEZONE = "Asia/Kolkata"

_CACHE: dict[tuple, dict] = {}


class WeatherServiceError(Exception):
    pass


class IncompleteWeatherError(WeatherServiceError):
    """Live weather did not cover the requested local calendar day."""


def _parse_local_timestamp(value: str, timezone: str) -> datetime.datetime:
    """Open-Meteo returns local clock times (no offset). Make them tz-aware."""
    naive = datetime.datetime.fromisoformat(value)
    return naive.replace(tzinfo=ZoneInfo(timezone))


async def fetch_weather_forecast(
    latitude: float,
    longitude: float,
    panel_tilt_degrees: float,
    panel_azimuth_degrees: float,
    date: str,
    timezone: str,
) -> dict:
    """Request one local calendar day (00:00-23:00) from Open-Meteo.

    Uses explicit start_date/end_date for the requested scenario date, never a
    rolling forecast_hours window. Raises WeatherServiceError when the provider
    is unreachable or the response shape is invalid.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join(
            ["global_tilted_irradiance", "wind_speed_10m", "cloud_cover"]
        ),
        "start_date": date,
        "end_date": date,
        "timezone": timezone,
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
        if not isinstance(values, list) or not values:
            raise WeatherServiceError(f"Weather response has invalid field: {field}")

    return {
        "timezone": data.get("timezone") or timezone,
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "date": date,
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
    date: str,
    timezone: str,
    solar_capacity_kw: float,
    wind_capacity_kw: float,
    solar_derating_factor: float,
) -> list[WeatherHour]:
    """Normalize a weather response into aligned local hours 0-23.

    hour_index is derived from each record's local timestamp. Records outside the
    requested local date are dropped, the remainder is sorted, duplicates are
    rejected, and all hours 0-23 must be present. Raises IncompleteWeatherError
    otherwise — the caller falls back to prepared data.
    """
    hourly = weather["hourly"]
    records: list[tuple[datetime.datetime, float, float, float]] = []
    for index in range(len(hourly["time"])):
        try:
            local_time = _parse_local_timestamp(hourly["time"][index], timezone)
        except ValueError as exc:
            raise IncompleteWeatherError(
                "LIVE_WEATHER_INCOMPLETE: unparseable timestamp"
            ) from exc
        if local_time.date().isoformat() != date:
            continue
        records.append(
            (
                local_time,
                float(hourly["global_tilted_irradiance"][index]),
                float(hourly["wind_speed_10m"][index]),
                float(hourly["cloud_cover"][index]),
            )
        )

    if not records:
        raise IncompleteWeatherError(
            "LIVE_WEATHER_INCOMPLETE: no records for the requested local date"
        )

    records.sort(key=lambda item: item[0])

    seen_hours: set[int] = set()
    hours: list[WeatherHour] = []
    for local_time, irradiance, wind_speed, cloud_cover in records:
        hour_index = local_time.hour
        if hour_index in seen_hours:
            raise IncompleteWeatherError(
                f"LIVE_WEATHER_INCOMPLETE: duplicate local hour {hour_index}"
            )
        seen_hours.add(hour_index)
        hours.append(
            WeatherHour(
                hour_index=hour_index,
                timestamp=local_time.isoformat(),
                solar_available_kwh=round(
                    calculate_solar_available_kwh(
                        irradiance,
                        solar_capacity_kw,
                        solar_derating_factor,
                    ),
                    3,
                ),
                wind_available_kwh=round(
                    calculate_wind_available_kwh(wind_speed, wind_capacity_kw),
                    3,
                ),
                cloud_cover_percent=round(cloud_cover, 1),
            )
        )

    if set(seen_hours) != set(range(24)):
        missing = sorted(set(range(24)) - seen_hours)
        raise IncompleteWeatherError(
            f"LIVE_WEATHER_INCOMPLETE: missing local hours {missing}"
        )

    return hours


def _prepared_fallback(timezone: str, code: str, message: str) -> WeatherForecastResponse:
    return WeatherForecastResponse(
        source="prepared_fallback",
        provider="open_meteo",
        timezone=timezone,
        hours=[],
        warnings=[
            {
                "code": code,
                "severity": "warning",
                "message": message,
            }
        ],
    )


def _log_weather_outcome(
    date: str,
    timezone: str,
    source: str,
    hours: list[WeatherHour],
    weather: dict | None,
) -> None:
    if not hours:
        logger.warning(
            "weather %s for date=%s tz=%s: no usable records",
            source,
            date,
            timezone,
        )
        return
    first = hours[0]
    last = hours[-1]
    logger.info(
        "weather %s date=%s tz=%s first=%s(%s) last=%s(%s) records=%d",
        source,
        date,
        timezone,
        first.hour_index,
        first.timestamp,
        last.hour_index,
        last.timestamp,
        len(hours),
    )


async def get_weather_forecast(
    latitude: float,
    longitude: float,
    solar_capacity_kw: float,
    wind_capacity_kw: float,
    panel_tilt_degrees: float,
    panel_azimuth_degrees: float,
    solar_derating_factor: float,
    date: str,
    timezone: str,
) -> WeatherForecastResponse:
    """Live forecast for the requested local day with graceful fallbacks.

    Order: live Open-Meteo -> cached last success for the same day -> raise
    (endpoint returns prepared fallback with LIVE_WEATHER_INCOMPLETE, or 503
    WEATHER_UNAVAILABLE when the provider is unreachable).
    """
    cache_key = (
        round(latitude, 4),
        round(longitude, 4),
        date,
        timezone,
    )

    try:
        weather = await fetch_weather_forecast(
            latitude=latitude,
            longitude=longitude,
            panel_tilt_degrees=panel_tilt_degrees,
            panel_azimuth_degrees=panel_azimuth_degrees,
            date=date,
            timezone=timezone,
        )
    except WeatherServiceError:
        cached = _CACHE.get(cache_key)
        if cached is None:
            raise
        cached_hours = transform_weather_to_energy(
            weather=cached,
            date=date,
            timezone=timezone,
            solar_capacity_kw=solar_capacity_kw,
            wind_capacity_kw=wind_capacity_kw,
            solar_derating_factor=solar_derating_factor,
        )
        _log_weather_outcome(date, timezone, "cached", cached_hours, cached)
        return WeatherForecastResponse(
            source="cached",
            provider="open_meteo",
            timezone=timezone,
            hours=cached_hours,
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

    try:
        hours = transform_weather_to_energy(
            weather=weather,
            date=date,
            timezone=timezone,
            solar_capacity_kw=solar_capacity_kw,
            wind_capacity_kw=wind_capacity_kw,
            solar_derating_factor=solar_derating_factor,
        )
    except IncompleteWeatherError as exc:
        cached = _CACHE.get(cache_key)
        if cached is not None:
            try:
                cached_hours = transform_weather_to_energy(
                    weather=cached,
                    date=date,
                    timezone=timezone,
                    solar_capacity_kw=solar_capacity_kw,
                    wind_capacity_kw=wind_capacity_kw,
                    solar_derating_factor=solar_derating_factor,
                )
                _log_weather_outcome(date, timezone, "cached", cached_hours, cached)
                return WeatherForecastResponse(
                    source="cached",
                    provider="open_meteo",
                    timezone=timezone,
                    hours=cached_hours,
                    warnings=[
                        {
                            "code": "LIVE_WEATHER_INCOMPLETE",
                            "severity": "warning",
                            "message": str(exc),
                        }
                    ],
                )
            except IncompleteWeatherError:
                pass
        logger.warning("live weather incomplete for %s: %s", date, exc)
        raise

    _CACHE[cache_key] = weather
    _log_weather_outcome(date, timezone, "live", hours, weather)
    return WeatherForecastResponse(
        source="live",
        provider="open_meteo",
        timezone=timezone,
        hours=hours,
    )