import json
from pathlib import Path

import pulp
from fastapi import APIRouter, HTTPException, Response

from app.core.database import database_is_ready
from app.models import OptimizationRequest, OptimizationResponse
from app.services.csv_export import render_export_csv
from app.services.optimizer import OptimizationError, optimize_microgrid
from app.services.persistence import persist_run

router = APIRouter(prefix="/api/v1")


@router.get("/health")
async def health() -> dict[str, str]:
    return {
        "api": "ok",
        "solver": "ok" if pulp.PULP_CBC_CMD(msg=False).available() else "unavailable",
        "database": "ok" if await database_is_ready() else "unavailable",
    }


@router.get("/scenarios/demo", response_model=OptimizationRequest)
async def demo_scenario() -> OptimizationRequest:
    path = Path("/app/data/demo_scenario.json")
    if not path.exists():
        path = Path(__file__).resolve().parents[3] / "data" / "demo_scenario.json"
    return OptimizationRequest.model_validate(json.loads(path.read_text(encoding="utf-8")))


@router.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: OptimizationRequest) -> OptimizationResponse:
    try:
        response = optimize_microgrid(request)
    except OptimizationError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    persistence, warnings = await persist_run(request, response)
    return response.model_copy(update={"persistence": persistence, "warnings": warnings})


@router.post("/optimize/export", response_class=Response)
async def export_csv(response: OptimizationResponse) -> Response:
    return Response(
        content=render_export_csv(response),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{response.run_id}.csv"'},
    )