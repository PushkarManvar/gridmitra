"""User and session persistence for Phase B auth."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import text

from app.core.database import engine

SESSION_TTL_DAYS = 7


def _public_user(row) -> dict:
    return {
        "user_id": str(row["id"]),
        "email": row["email"],
        "display_name": row["display_name"],
        "role": row["role"],
    }


async def get_user_by_email(email: str) -> dict | None:
    async with engine.connect() as connection:
        row = await connection.execute(
            text(
                "select id, email, password_hash, display_name, role"
                "  from gridmitra.users where email = :email"
            ),
            {"email": email},
        )
        found = row.first()
        return dict(found._mapping) if found else None


async def get_user_by_id(user_id: str) -> dict | None:
    async with engine.connect() as connection:
        row = await connection.execute(
            text(
                "select id, email, password_hash, display_name, role"
                "  from gridmitra.users where id = :id"
            ),
            {"id": user_id},
        )
        found = row.first()
        return dict(found._mapping) if found else None


async def create_user(email: str, password_hash: str, display_name: str, role: str) -> dict:
    user_id = str(uuid.uuid4())
    async with engine.begin() as connection:
        await connection.execute(
            text(
                "insert into gridmitra.users (id, email, password_hash, display_name, role)"
                " values (:id, :email, :password_hash, :display_name, :role)"
            ),
            {
                "id": user_id,
                "email": email,
                "password_hash": password_hash,
                "display_name": display_name,
                "role": role,
            },
        )
    return await get_user_by_id(user_id)


async def create_session(user_id: str) -> str:
    session_id = str(uuid.uuid4())
    now = datetime.now(UTC)
    expires = now + timedelta(days=SESSION_TTL_DAYS)
    async with engine.begin() as connection:
        await connection.execute(
            text(
                "insert into gridmitra.sessions (id, user_id, created_at, expires_at)"
                " values (:id, :user_id, :created_at, :expires_at)"
            ),
            {
                "id": session_id,
                "user_id": user_id,
                "created_at": now,
                "expires_at": expires,
            },
        )
    return session_id


async def get_user_by_session(session_id: str | None) -> dict | None:
    if not session_id:
        return None
    async with engine.connect() as connection:
        row = await connection.execute(
            text(
                "select u.id, u.email, u.password_hash, u.display_name, u.role"
                "  from gridmitra.sessions s"
                "  join gridmitra.users u on u.id = s.user_id"
                "  where s.id = :id and s.expires_at > now()"
            ),
            {"id": session_id},
        )
        found = row.first()
        return dict(found._mapping) if found else None


async def delete_session(session_id: str | None) -> None:
    if not session_id:
        return
    async with engine.begin() as connection:
        await connection.execute(
            text("delete from gridmitra.sessions where id = :id"), {"id": session_id}
        )


async def seed_demo_user() -> None:
    """Ensure the prepared offline demo account exists with a valid Argon2 hash.

    Runs at application startup after migrations. The migration seeds the row
    with a placeholder hash; here we replace it with the real demo password.
    """
    from app.core.security import DEMO_USER_EMAIL, DEMO_USER_PASSWORD, hash_password

    user = await get_user_by_email(DEMO_USER_EMAIL)
    password_hash = hash_password(DEMO_USER_PASSWORD)
    if user is None:
        await create_user(DEMO_USER_EMAIL, password_hash, "Demo Operator", "operator")
    else:
        async with engine.begin() as connection:
            await connection.execute(
                text(
                    "update gridmitra.users set password_hash = :hash,"
                    " display_name = 'Demo Operator'"
                    " where id = :id"
                ),
                {"hash": password_hash, "id": user["id"]},
            )