"""Saved scenario versions per owner (Decision 014)."""

import json
import uuid

from sqlalchemy import text

from app.core.database import engine
from app.repositories.owner import demo_owner_id


def _decode_json(value) -> dict:
    """jsonb comes back as a dict from asyncpg or as a string from other drivers."""
    if isinstance(value, str):
        return json.loads(value)
    return value


async def save_scenario_version(
    name: str,
    scenario_type: str,
    payload: dict,
) -> int:
    """Save the next immutable version of the scenario. Returns the version."""
    owner_id = await demo_owner_id()
    async with engine.begin() as connection:
        row = await connection.execute(
            text(
                "select coalesce(max(version), 0) as max_version"
                "  from gridmitra.scenario_versions"
                "  where owner_id = :owner_id and name = :name"
            ),
            {"owner_id": owner_id, "name": name},
        )
        next_version = int(row.scalar() or 0) + 1
        await connection.execute(
            text(
                "insert into gridmitra.scenario_versions"
                " (id, owner_id, name, scenario_type, version, payload)"
                " values (:id, :owner_id, :name, :scenario_type, :version, :payload)"
            ),
            {
                "id": str(uuid.uuid4()),
                "owner_id": owner_id,
                "name": name,
                "scenario_type": scenario_type,
                "version": next_version,
                "payload": json.dumps(payload),
            },
        )
    return next_version


async def list_scenarios() -> list[dict]:
    """List the latest saved version of each scenario."""
    owner_id = await demo_owner_id()
    async with engine.connect() as connection:
        rows = await connection.execute(
            text(
                "select s.name, s.scenario_type, s.version, s.created_at, s.payload"
                "  from gridmitra.scenario_versions s"
                "  join ("
                "    select name, max(version) as version"
                "      from gridmitra.scenario_versions"
                "      where owner_id = :owner_id group by name"
                "  ) latest on latest.name = s.name and latest.version = s.version"
                "  where s.owner_id = :owner_id"
                "  order by s.created_at desc"
            ),
            {"owner_id": owner_id},
        )
        return [
            {
                "name": row.name,
                "scenario_type": row.scenario_type,
                "version": row.version,
                "created_at": row.created_at,
                "payload": _decode_json(row.payload),
            }
            for row in rows
        ]


async def get_scenario_version(name: str, version: int | None = None) -> dict | None:
    """Fetch a specific version (default latest) of a scenario."""
    owner_id = await demo_owner_id()
    async with engine.connect() as connection:
        params = {"owner_id": owner_id, "name": name}
        if version is None:
            row = await connection.execute(
                text(
                    "select s.scenario_type, s.version, s.created_at, s.payload"
                    "  from gridmitra.scenario_versions s"
                    "  where s.owner_id = :owner_id and s.name = :name"
                    "  order by s.version desc limit 1"
                ),
                params,
            )
        else:
            row = await connection.execute(
                text(
                    "select s.scenario_type, s.version, s.created_at, s.payload"
                    "  from gridmitra.scenario_versions s"
                    "  where s.owner_id = :owner_id and s.name = :name and s.version = :version"
                ),
                {**params, "version": version},
            )
        found = row.first()
        if found is None:
            return None
        return {
            "name": name,
            "scenario_type": found.scenario_type,
            "version": found.version,
            "created_at": found.created_at,
            "payload": _decode_json(found.payload),
        }