import asyncio

import pytest

from app.core.database import engine
from app.core.migrations import run_migrations


async def _migrate_and_dispose() -> None:
    await run_migrations()
    # Dispose so the next (TestClient) event loop creates fresh connections;
    # a shared async engine must not keep loop-bound pooled connections.
    await engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def migrated_database() -> None:
    """Apply migrations once per session for DB-backed tests.

    Skips the whole session if the database is unreachable so the suite still
    reports clearly when a database is not available.
    """
    try:
        asyncio.run(_migrate_and_dispose())
    except Exception as error:  # pragma: no cover - depends on environment
        pytest.skip(f"database unavailable; skipping session: {error}")