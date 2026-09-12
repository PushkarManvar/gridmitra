from fastapi import APIRouter, HTTPException, Query

from app.schemas.weather import WeatherForecastResponse
from app.services.weather_service import (
    DEFAULT_TIMEZONE,
    IncompleteWeatherError,
    WeatherServiceError,
    get_weather_forecast,
)

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_live_forecast(
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
    solar_capacity_kw: float = Query(ge=0),
    wind_capacity_kw: float = Query(ge=0),
    panel_tilt_degrees: float = Query(ge=0, le=90),
    panel_azimuth_degrees: float = Query(ge=-180, le=180),
    solar_derating_factor: float = Query(default=0.85, gt=0, le=1),
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    timezone: str = Query(default=DEFAULT_TIMEZONE),
) -> WeatherForecastResponse:
    try:
        return await get_weather_forecast(
            latitude=latitude,
            longitude=longitude,
            solar_capacity_kw=solar_capacity_kw,
            wind_capacity_kw=wind_capacity_kw,
            panel_tilt_degrees=panel_tilt_degrees,
            panel_azimuth_degrees=panel_azimuth_degrees,
            solar_derating_factor=solar_derating_factor,
            date=date,
            timezone=timezone,
        )
    except IncompleteWeatherError:
        # Never send incomplete or misaligned live data into the optimizer.
        return WeatherForecastResponse(
            source="prepared_fallback",
            provider="open_meteo",
            timezone=timezone,
            hours=[],
            warnings=[
                {
                    "code": "LIVE_WEATHER_INCOMPLETE",
                    "severity": "warning",
                    "message": (
                        f"Live weather did not contain all 24 local hours for "
                        f"{date} in {timezone}. Prepared weather data was used."
                    ),
                }
            ],
        )
    except WeatherServiceError:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "WEATHER_UNAVAILABLE",
                "message": "Live weather is unavailable. Use prepared data.",
            },
        ) from None