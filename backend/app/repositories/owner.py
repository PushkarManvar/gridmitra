"""Owner resolution: Firebase user when an ID token is valid, else the demo owner."""

import uuid

from sqlalchemy import text

from app.core.database import engine
from app.services.firebase_auth import verify_id_token

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


async def ensure_firebase_user(uid: str, email: str | None, name: str | None) -> str | None:
    """Map a Firebase uid to a users row, creating it if needed."""
    async with engine.begin() as connection:
        row = await connection.execute(
            text("select id from gridmitra.users where firebase_uid = :uid"),
            {"uid": uid},
        )
        found = row.first()
        if found is not None:
            return str(found[0])

        user_id = str(uuid.uuid4())
        safe_email = email or f"{uid}@gridmitra.firebase"
        display_name = name or "Operator"
        await connection.execute(
            text(
                "insert into gridmitra.users"
                " (id, email, password_hash, display_name, role, firebase_uid)"
                " values (:id, :email, '', :display_name, 'operator', :uid)"
                " on conflict (email) do update set firebase_uid = excluded.firebase_uid"
            ),
            {
                "id": user_id,
                "email": safe_email,
                "display_name": display_name,
                "uid": uid,
            },
        )
        return user_id


async def resolve_owner_id(id_token: str | None) -> str | None:
    """Return the owner id for a request: Firebase user or demo owner."""
    claims = await verify_id_token(id_token)
    if claims and claims.get("uid"):
        owner = await ensure_firebase_user(
            claims["uid"], claims.get("email"), claims.get("name")
        )
        if owner:
            return owner
    return await demo_owner_id()