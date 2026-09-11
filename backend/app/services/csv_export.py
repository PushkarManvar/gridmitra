import csv
import io

from app.models import OptimizationResponse

DISPATCH_COLUMNS = [
    "hour_index",
    "timestamp",
    "solar_available_kwh",
    "solar_used_kwh",
    "wind_available_kwh",
    "wind_used_kwh",
    "battery_energy_start_kwh",
    "battery_charge_kwh",
    "battery_discharge_kwh",
    "battery_energy_end_kwh",
    "diesel_generation_kwh",
    "p1_demand_kwh",
    "p2_demand_kwh",
    "p3_demand_kwh",
    "p4_demand_kwh",
    "p1_served_kwh",
    "p2_served_kwh",
    "p3_served_kwh",
    "p4_served_kwh",
    "p1_unserved_kwh",
    "p2_unserved_kwh",
    "p3_unserved_kwh",
    "p4_unserved_kwh",
    "renewable_curtailment_kwh",
    "fuel_cost",
    "co2_kg",
]


def render_export_csv(response: OptimizationResponse) -> str:
    """Render the full run as CSV: metadata, 24 dispatch rows, summaries.

    The CSV is generated entirely from the in-memory response, so it stays
    available even when database persistence fails (TEST_PLAN E04).
    """
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["section", "field", "value"])
    writer.writerow(["run", "run_id", response.run_id])
    writer.writerow(["run", "status", response.status])
    writer.writerow(["run", "scenario_id", response.scenario_id])

    writer.writerow([])
    writer.writerow(["dispatch", *DISPATCH_COLUMNS])
    for hour in response.dispatch_hours:
        writer.writerow(
            ["dispatch", *[getattr(hour, column) for column in DISPATCH_COLUMNS]]
        )

    writer.writerow([])
    writer.writerow(["summary", "field", "value"])
    for field, value in response.summary.model_dump().items():
        writer.writerow(["summary", field, value])

    writer.writerow([])
    writer.writerow(["baseline_summary", "field", "value"])
    for field, value in response.baseline_summary.model_dump().items():
        writer.writerow(["baseline_summary", field, value])

    writer.writerow([])
    writer.writerow(["explanations", "code", "severity", "hour_index", "message"])
    for explanation in response.explanations:
        writer.writerow(
            [
                "explanations",
                explanation.code,
                explanation.severity,
                explanation.hour_index,
                explanation.message,
            ]
        )

    writer.writerow([])
    writer.writerow(["warnings", "code", "severity", "hour_index", "message"])
    for warning in response.warnings:
        writer.writerow(
            ["warnings", warning.code, warning.severity, warning.hour_index, warning.message]
        )

    return buffer.getvalue()