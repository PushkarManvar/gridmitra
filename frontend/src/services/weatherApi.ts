import type { WeatherForecast } from "../types/weather";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface WeatherRequest {
  latitude: number;
  longitude: number;
  solar_capacity_kw: number;
  wind_capacity_kw: number;
  panel_tilt_degrees: number;
  panel_azimuth_degrees: number;
  solar_derating_factor: number;
  date: string;
  timezone: string;
}

export async function fetchWeatherForecast(
  request: WeatherRequest,
): Promise<WeatherForecast> {
  const params = new URLSearchParams();
  Object.entries(request).forEach(([key, value]) => params.set(key, String(value)));
  const response = await fetch(`${API_URL}/api/v1/weather/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }
  return (await response.json()) as WeatherForecast;
}