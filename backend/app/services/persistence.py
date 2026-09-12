import logging

from app.models import OptimizationRequest, OptimizationResponse, Persistence, Warning
from app.repositories.persistence import save_run

logger = logging.getLogger(__name__)


async def persist_run(
    request: OptimizationRequest,
    response: OptimizationResponse,
    owner_id: str,
) -> tuple[Persistence, list[Warning]]:
    """Save a calculated run and degrade gracefully when the database is down.

    The calculated result is never lost: on failure the response returns with
    `persistence.saved = false` plus a `DATABASE_SAVE_FAILED` warning.
    """
    try:
        await save_run(request, response, owner_id=owner_id)
    except Exception:
        logger.exception("persistence save failed; returning calculated result")
        return (
            Persistence(saved=False, message="DATABASE_SAVE_FAILED"),
            [
                *response.warnings,
                Warning(
                    code="DATABASE_SAVE_FAILED",
                    severity="warning",
                    message="The calculated plan could not be saved to the database.",
                ),
            ],
        )
    return Persistence(saved=True), response.warnings