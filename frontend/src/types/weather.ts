export type WeatherSource = "live" | "cached" | "prepared_fallback";

export interface WeatherHour {
  hour_index: number;
  timestamp: string;
  solar_available_kwh: number;
  wind_available_kwh: number;
  cloud_cover_percent: number;
}

export interface WeatherForecast {
  source: WeatherSource;
  provider: string;
  timezone: string | null;
  hours: WeatherHour[];
  warnings: Array<{
    code: string;
    severity: string;
    message: string;
    hour_index?: number | null;
  }>;
}