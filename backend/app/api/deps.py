from typing import Annotated

from fastapi import Depends, HTTPException, Request

from app.repositories.auth import get_user_by_session

SESSION_COOKIE = "gridmitra_session"


async def get_current_user(request: Request) -> dict:
    session_id = request.cookies.get(SESSION_COOKIE)
    user = await get_user_by_session(session_id)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "UNAUTHORIZED", "message": "Authentication required."}},
        )
    return user


async def require_operator(user: Annotated[dict, Depends(get_current_user)]) -> dict:
    if user["role"] not in ("admin", "operator"):
        raise HTTPException(
            status_code=403,
            detail={"error": {"code": "FORBIDDEN", "message": "Operator role required."}},
        )
    return user