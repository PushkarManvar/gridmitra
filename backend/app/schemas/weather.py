from typing import Literal

from pydantic import BaseModel, Field

from app.models import Warning

WeatherSource = Literal["live", "cached", "prepared_fallback"]


class WeatherHour(BaseModel):
    hour_index: int = Field(ge=0, le=23)
    timestamp: str
    solar_available_kwh: float = Field(ge=0)
    wind_available_kwh: float = Field(ge=0)
    cloud_cover_percent: float = Field(ge=0, le=100)


class WeatherForecastResponse(BaseModel):
    source: WeatherSource
    provider: str
    timezone: str | None = None
    hours: list[WeatherHour]
    warnings: list[Warning] = []