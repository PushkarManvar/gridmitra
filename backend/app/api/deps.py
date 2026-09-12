from fastapi import Header

from app.repositories.owner import resolve_owner_id


async def current_owner_id(authorization: str | None = Header(default=None)) -> str:
    """Resolve the request's owner: Firebase user via Bearer token, else demo."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    return await resolve_owner_id(token or None)