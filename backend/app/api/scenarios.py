from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import current_owner_id
from app.models import OptimizationRequest
from app.repositories.scenarios import (
    get_scenario_version,
    list_scenarios,
    save_scenario_version,
)

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("")
async def scenarios(owner_id: Annotated[str, Depends(current_owner_id)]) -> dict:
    return {"scenarios": await list_scenarios(owner_id)}


@router.post("", status_code=201)
async def save_scenario(
    request: OptimizationRequest,
    owner_id: Annotated[str, Depends(current_owner_id)],
) -> dict:
    version = await save_scenario_version(
        owner_id=owner_id,
        name=request.scenario_name,
        scenario_type=request.scenario_type,
        payload=request.model_dump(),
    )
    return {
        "name": request.scenario_name,
        "scenario_type": request.scenario_type,
        "version": version,
    }


@router.get("/{name}/latest")
async def latest_scenario(
    name: str,
    owner_id: Annotated[str, Depends(current_owner_id)],
) -> dict:
    found = await get_scenario_version(owner_id, name)
    if found is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "SCENARIO_NOT_FOUND",
                    "message": f"Scenario '{name}' not found.",
                }
            },
        )
    return found


@router.get("/{name}/versions")
async def scenario_versions(
    name: str,
    owner_id: Annotated[str, Depends(current_owner_id)],
) -> dict:
    found = await get_scenario_version(owner_id, name)
    if found is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "SCENARIO_NOT_FOUND",
                    "message": f"Scenario '{name}' not found.",
                }
            },
        )
    return {
        "latest": found,
        "versions": [
            {"version": found["version"], "created_at": found["created_at"]}
        ],
    }