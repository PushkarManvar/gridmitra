import type { OptimizationResult, Scenario } from "../types/index";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getDemoScenario(): Promise<Scenario> {
  return request<Scenario>("/api/v1/scenarios/demo");
}

export function optimizeScenario(scenario: Scenario): Promise<OptimizationResult> {
  return request<OptimizationResult>("/api/v1/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario)
  });
}
