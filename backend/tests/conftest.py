import asyncio

import pytest
from fastapi.testclient import TestClient

from app.core.database import engine
from app.core.migrations import run_migrations
from app.main import app


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


@pytest.fixture(scope="session")
def client(migrated_database) -> TestClient:
    """An authenticated API client. Registers a test operator and logs in so the
    session cookie is present for every protected endpoint."""
    test_client = TestClient(app, base_url="https://testserver")
    credentials = {
        "email": "tester@gridmitra.com",
        "display_name": "Test Operator",
        "password": "test-pass-1234",
    }
    register = test_client.post("/api/v1/auth/register", json=credentials)
    # A prior run may have persisted the user; either way we log in afterwards.
    assert register.status_code in (201, 409)
    login = test_client.post(
        "/api/v1/auth/login",
        json={"email": credentials["email"], "password": credentials["password"]},
    )
    assert login.status_code == 200
    return test_client