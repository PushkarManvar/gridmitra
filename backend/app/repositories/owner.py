"""Interim single-owner helper until Firebase auth defines real identity.

Manual auth was removed; until Firebase is wired, all runs and scenarios are
owned by the seeded demo operator so the NOT NULL owner columns stay satisfied.
"""

from sqlalchemy import text

from app.core.database import engine

_DEMO_OWNER_ID: str | None = None


async def demo_owner_id() -> str | None:
    global _DEMO_OWNER_ID
    if _DEMO_OWNER_ID is None:
        async with engine.connect() as connection:
            row = await connection.execute(
                text(
                    "select id from gridmitra.users"
                    " where email = 'demo@gridmitra.com'"
                )
            )
            found = row.first()
            _DEMO_OWNER_ID = str(found[0]) if found else None
    return _DEMO_OWNER_ID