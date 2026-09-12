import json
import uuid
from datetime import datetime, timedelta

from sqlalchemy import text

from app.core.database import engine
from app.models import OptimizationRequest, OptimizationResponse
from app.services.constants import (
    MODEL_VERSION,
    SCENARIO_SOURCE_DEFAULT,
    SOLVER_NAME,
)

_NAMESPACE = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def _decode_json(value) -> dict:
    """jsonb comes back as a dict from asyncpg or as a string from other drivers."""
    if isinstance(value, str):
        return json.loads(value)
    return value


def _uuid(value: str) -> str:
    return str(uuid.uuid5(_NAMESPACE, value))


def _as_datetime(value: str, site_start: str, hour_index: int | None = None) -> datetime:
    if value:
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            pass
    start = datetime.fromisoformat(site_start)
    return start + timedelta(hours=hour_index or 0)


async def save_run(request: OptimizationRequest, response: OptimizationResponse) -> None:
    """Persist a calculated run in one transaction.

    Saves the site, site assets, scenario, 24 scenario hours, the run summary,
    the 24 dispatch hours and the decision explanations atomically. Raises on
    failure; the caller decides how to degrade gracefully.
    """
    site_uuid = _uuid(f"site:{request.site.site_id}")
    scenario_uuid = _uuid(f"scenario:{request.scenario_id}")
    run_uuid = response.run_id
    start_time = _as_datetime(request.site.start_time, request.site.start_time)

    async with engine.begin() as connection:
        await connection.execute(
            text(
                "insert into gridmitra.sites (id, name, timezone, currency) "
                "values (:id, :name, :timezone, :currency) "
                "on conflict (id) do update set "
                "  name = excluded.name,"
                "  timezone = excluded.timezone,"
                "  currency = excluded.currency,"
                "  updated_at = now()"
            ),
            {
                "id": site_uuid,
                "name": request.site.site_name,
                "timezone": request.site.timezone,
                "currency": request.site.currency,
            },
        )

        await connection.execute(
            text(
                "insert into gridmitra.site_assets ("
                "  id, site_id,"
                "  solar_capacity_kw, wind_capacity_kw,"
                "  battery_capacity_kwh, battery_minimum_energy_kwh,"
                "  battery_maximum_energy_kwh,"
                "  battery_maximum_charge_kw, battery_maximum_discharge_kw,"
                "  battery_charge_efficiency, battery_discharge_efficiency,"
                "  battery_wear_cost_per_kwh,"
                "  diesel_maximum_kw, diesel_fuel_consumption_l_per_kwh,"
                "  diesel_emission_factor_kg_co2_per_l"
                ") values ("
                "  :id, :site_id,"
                "  :solar_capacity_kw, :wind_capacity_kw,"
                "  :battery_capacity_kwh, :battery_minimum_energy_kwh,"
                "  :battery_maximum_energy_kwh,"
                "  :battery_maximum_charge_kw, :battery_maximum_discharge_kw,"
                "  :battery_charge_efficiency, :battery_discharge_efficiency,"
                "  :battery_wear_cost_per_kwh,"
                "  :diesel_maximum_kw, :diesel_fuel_consumption_l_per_kwh,"
                "  :diesel_emission_factor_kg_co2_per_l"
                ") on conflict (id) do update set"
                "  solar_capacity_kw = excluded.solar_capacity_kw,"
                "  wind_capacity_kw = excluded.wind_capacity_kw,"
                "  battery_capacity_kwh = excluded.battery_capacity_kwh,"
                "  battery_minimum_energy_kwh = excluded.battery_minimum_energy_kwh,"
                "  battery_maximum_energy_kwh = excluded.battery_maximum_energy_kwh,"
                "  battery_maximum_charge_kw = excluded.battery_maximum_charge_kw,"
                "  battery_maximum_discharge_kw = excluded.battery_maximum_discharge_kw,"
                "  battery_charge_efficiency = excluded.battery_charge_efficiency,"
                "  battery_discharge_efficiency = excluded.battery_discharge_efficiency,"
                "  battery_wear_cost_per_kwh = excluded.battery_wear_cost_per_kwh,"
                "  diesel_maximum_kw = excluded.diesel_maximum_kw,"
                "  diesel_fuel_consumption_l_per_kwh ="
                "    excluded.diesel_fuel_consumption_l_per_kwh,"
                "  diesel_emission_factor_kg_co2_per_l ="
                "    excluded.diesel_emission_factor_kg_co2_per_l"
            ),
            {
                "id": _uuid(f"assets:{request.site.site_id}"),
                "site_id": site_uuid,
                "solar_capacity_kw": request.assets.solar.capacity_kw,
                "wind_capacity_kw": request.assets.wind.capacity_kw,
                "battery_capacity_kwh": request.assets.battery.capacity_kwh,
                "battery_minimum_energy_kwh": request.assets.battery.minimum_energy_kwh,
                "battery_maximum_energy_kwh": request.assets.battery.maximum_energy_kwh,
                "battery_maximum_charge_kw": request.assets.battery.maximum_charge_kw,
                "battery_maximum_discharge_kw": request.assets.battery.maximum_discharge_kw,
                "battery_charge_efficiency": request.assets.battery.charge_efficiency,
                "battery_discharge_efficiency": request.assets.battery.discharge_efficiency,
                "battery_wear_cost_per_kwh": request.assets.battery.wear_cost_per_kwh,
                "diesel_maximum_kw": request.assets.diesel.maximum_kw,
                "diesel_fuel_consumption_l_per_kwh": (
                    request.assets.diesel.fuel_consumption_l_per_kwh
                ),
                "diesel_emission_factor_kg_co2_per_l": (
                    request.assets.diesel.emission_factor_kg_co2_per_l
                ),
            },
        )

        await connection.execute(
            text(
                "insert into gridmitra.scenarios ("
                "  id, site_id, name, scenario_type, start_time, interval_hours,"
                "  initial_battery_energy_kwh, terminal_reserve_target_kwh,"
                "  fuel_price_per_l, carbon_price_per_kg_co2, source"
                ") values ("
                "  :id, :site_id, :name, :scenario_type, :start_time, :interval_hours,"
                "  :initial_battery_energy_kwh, :terminal_reserve_target_kwh,"
                "  :fuel_price_per_l, :carbon_price_per_kg_co2, :source"
                ") on conflict (id) do update set"
                "  name = excluded.name,"
                "  scenario_type = excluded.scenario_type,"
                "  start_time = excluded.start_time,"
                "  interval_hours = excluded.interval_hours,"
                "  initial_battery_energy_kwh = excluded.initial_battery_energy_kwh,"
                "  terminal_reserve_target_kwh = excluded.terminal_reserve_target_kwh,"
                "  fuel_price_per_l = excluded.fuel_price_per_l,"
                "  carbon_price_per_kg_co2 = excluded.carbon_price_per_kg_co2,"
                "  source = excluded.source"
            ),
            {
                "id": scenario_uuid,
                "site_id": site_uuid,
                "name": request.scenario_name,
                "scenario_type": request.scenario_type,
                "start_time": start_time,
                "interval_hours": request.site.interval_hours,
                "initial_battery_energy_kwh": request.assets.battery.initial_energy_kwh,
                "terminal_reserve_target_kwh": request.assets.battery.terminal_reserve_target_kwh,
                "fuel_price_per_l": request.assets.diesel.fuel_price_per_l,
                "carbon_price_per_kg_co2": request.operating_policy.carbon_price_per_kg_co2,
                "source": SCENARIO_SOURCE_DEFAULT,
            },
        )

        for hour in request.hours:
            await connection.execute(
                text(
                    "insert into gridmitra.scenario_hours ("
                    "  id, scenario_id, hour_index, timestamp,"
                    "  solar_available_kwh, wind_available_kwh,"
                    "  p1_demand_kwh, p2_demand_kwh, p3_demand_kwh, p4_demand_kwh"
                    ") values ("
                    "  :id, :scenario_id, :hour_index, :timestamp,"
                    "  :solar_available_kwh, :wind_available_kwh,"
                    "  :p1_demand_kwh, :p2_demand_kwh, :p3_demand_kwh, :p4_demand_kwh"
                    ") on conflict (id) do update set"
                    "  timestamp = excluded.timestamp,"
                    "  solar_available_kwh = excluded.solar_available_kwh,"
                    "  wind_available_kwh = excluded.wind_available_kwh,"
                    "  p1_demand_kwh = excluded.p1_demand_kwh,"
                    "  p2_demand_kwh = excluded.p2_demand_kwh,"
                    "  p3_demand_kwh = excluded.p3_demand_kwh,"
                    "  p4_demand_kwh = excluded.p4_demand_kwh"
                ),
                {
                    "id": _uuid(f"scenario_hour:{request.scenario_id}:{hour.hour_index}"),
                    "scenario_id": scenario_uuid,
                    "hour_index": hour.hour_index,
                    "timestamp": _as_datetime(
                        hour.timestamp, request.site.start_time, hour.hour_index
                    ),
                    "solar_available_kwh": hour.solar_available_kwh,
                    "wind_available_kwh": hour.wind_available_kwh,
                    "p1_demand_kwh": hour.p1_demand_kwh,
                    "p2_demand_kwh": hour.p2_demand_kwh,
                    "p3_demand_kwh": hour.p3_demand_kwh,
                    "p4_demand_kwh": hour.p4_demand_kwh,
                },
            )

        await connection.execute(
            text(
                "insert into gridmitra.optimization_runs ("
                "  id, scenario_id, status, solver_name, solver_status, model_version,"
                "  input_snapshot, summary, baseline_summary, persistence_warning"
                ") values ("
                "  :id, :scenario_id, :status, :solver_name, :solver_status, :model_version,"
                "  :input_snapshot, :summary, :baseline_summary, :persistence_warning"
                ") on conflict (id) do nothing"
            ),
            {
                "id": run_uuid,
                "scenario_id": scenario_uuid,
                "status": response.status,
                "solver_name": SOLVER_NAME,
                "solver_status": "Optimal",
                "model_version": MODEL_VERSION,
                "input_snapshot": json.dumps(request.model_dump()),
                "summary": json.dumps(response.summary.model_dump()),
                "baseline_summary": json.dumps(response.baseline_summary.model_dump()),
                "persistence_warning": None,
            },
        )

        for hour in response.dispatch_hours:
            await connection.execute(
                text(
                    "insert into gridmitra.dispatch_hours ("
                    "  id, run_id, hour_index, timestamp, result"
                    ") values (:id, :run_id, :hour_index, :timestamp, :result) "
                    "on conflict (id) do nothing"
                ),
                {
                    "id": _uuid(f"dispatch:{response.run_id}:{hour.hour_index}"),
                    "run_id": run_uuid,
                    "hour_index": hour.hour_index,
                    "timestamp": _as_datetime(
                        hour.timestamp, request.site.start_time, hour.hour_index
                    ),
                    "result": json.dumps(hour.model_dump()),
                },
            )

        for explanation in response.explanations:
            await connection.execute(
                text(
                    "insert into gridmitra.decision_explanations ("
                    "  id, run_id, hour_index, code, severity, message, evidence"
                    ") values (:id, :run_id, :hour_index, :code, :severity, :message, :evidence) "
                    "on conflict (id) do nothing"
                ),
                {
                    "id": _uuid(
                        f"explanation:{response.run_id}:{explanation.code}:{explanation.hour_index}"
                    ),
                    "run_id": run_uuid,
                    "hour_index": explanation.hour_index,
                    "code": explanation.code,
                    "severity": explanation.severity,
                    "message": explanation.message,
                    "evidence": json.dumps(explanation.evidence),
                },
            )


async def list_runs(limit: int = 20) -> list[dict]:
    """List persisted runs newest first. Each item carries the parsed summary."""
    async with engine.connect() as connection:
        rows = await connection.execute(
            text(
                "select r.id, r.scenario_id, r.status, r.created_at, r.summary,"
                "       s.name as scenario_name, s.scenario_type"
                "  from gridmitra.optimization_runs r"
                "  left join gridmitra.scenarios s on s.id = r.scenario_id"
                "  order by r.created_at desc"
                "  limit :limit"
            ),
            {"limit": limit},
        )
        runs = []
        for row in rows:
            mapping = dict(row._mapping)
            runs.append(
                {
                    "run_id": str(mapping["id"]),
                    "scenario_id": str(mapping["scenario_id"]) if mapping["scenario_id"] else None,
                    "scenario_name": mapping["scenario_name"],
                    "scenario_type": mapping["scenario_type"],
                    "status": mapping["status"],
                    "created_at": mapping["created_at"],
                    "summary": _decode_json(mapping["summary"]),
                }
            )
        return runs


async def get_run(run_id: str) -> dict | None:
    """Return a persisted run with dispatch hours and explanations, or None."""
    async with engine.connect() as connection:
        row = await connection.execute(
            text(
                "select r.id, r.scenario_id, r.status, r.solver_name, r.solver_status,"
                "       r.model_version, r.input_snapshot, r.summary, r.baseline_summary,"
                "       r.persistence_warning, r.created_at,"
                "       s.name as scenario_name, s.scenario_type"
                "  from gridmitra.optimization_runs r"
                "  left join gridmitra.scenarios s on s.id = r.scenario_id"
                "  where r.id = :id"
            ),
            {"id": run_id},
        )
        run_row = row.first()
        if run_row is None:
            return None
        mapping = dict(run_row._mapping)

        dispatch_rows = await connection.execute(
            text(
                "select hour_index, timestamp, result"
                "  from gridmitra.dispatch_hours"
                "  where run_id = :id order by hour_index"
            ),
            {"id": run_id},
        )
        dispatch_hours = [
            _decode_json(row.result) for row in dispatch_rows
        ]

        explanation_rows = await connection.execute(
            text(
                "select hour_index, code, severity, message, evidence"
                "  from gridmitra.decision_explanations"
                "  where run_id = :id"
                "  order by hour_index nulls last"
            ),
            {"id": run_id},
        )
        explanations = [
            {
                "hour_index": row.hour_index,
                "code": row.code,
                "severity": row.severity,
                "message": row.message,
                "evidence": _decode_json(row.evidence),
            }
            for row in explanation_rows
        ]

        return {
            "run_id": str(mapping["id"]),
            "scenario_id": str(mapping["scenario_id"]) if mapping["scenario_id"] else None,
            "scenario_name": mapping["scenario_name"],
            "scenario_type": mapping["scenario_type"],
            "status": mapping["status"],
            "solver_name": mapping["solver_name"],
            "solver_status": mapping["solver_status"],
            "model_version": mapping["model_version"],
            "input_snapshot": _decode_json(mapping["input_snapshot"]),
            "persistence_warning": mapping["persistence_warning"],
            "created_at": mapping["created_at"],
            "summary": _decode_json(mapping["summary"]),
            "baseline_summary": _decode_json(mapping["baseline_summary"]),
            "dispatch_hours": dispatch_hours,
            "explanations": explanations,
        }