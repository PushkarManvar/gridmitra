import type {
  OptimizationResult,
  RunListItem,
  Scenario,
} from "../types/index";

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
    body: JSON.stringify(scenario),
  });
}

export async function getRuns(): Promise<RunListItem[]> {
  const payload = await request<{ runs: RunListItem[] }>("/api/v1/runs");
  return payload.runs;
}

export async function exportCsv(result: OptimizationResult): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/optimize/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });
  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] ?? `${result.run_id}.csv`;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}