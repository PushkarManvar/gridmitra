from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app.api.deps import SESSION_COOKIE, get_current_user
from app.core.security import hash_password, verify_password
from app.models import LoginRequest, RegisterRequest, User
from app.repositories.auth import (
    create_session,
    create_user,
    delete_session,
    get_user_by_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])

SESSION_MAX_AGE = 7 * 24 * 3600


def _user_model(row) -> User:
    return User(
        user_id=str(row["id"]),
        email=row["email"],
        display_name=row["display_name"],
        role=row["role"],
    )


def _set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=SESSION_MAX_AGE,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE, path="/")


@router.post("/register", response_model=User, status_code=201)
async def register(body: RegisterRequest) -> User:
    if await get_user_by_email(body.email) is not None:
        raise HTTPException(
            status_code=409,
            detail={"error": {"code": "EMAIL_EXISTS", "message": "Email already registered."}},
        )
    row = await create_user(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        role="operator",
    )
    return _user_model(row)


@router.post("/login", response_model=User)
async def login(body: LoginRequest, response: Response) -> User:
    row = await get_user_by_email(body.email)
    if row is None or not verify_password(row["password_hash"], body.password):
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "UNAUTHORIZED", "message": "Invalid email or password."}},
        )
    session_id = await create_session(str(row["id"]))
    _set_session_cookie(response, session_id)
    return _user_model(row)


@router.post("/logout")
async def logout(response: Response, request: Request) -> dict:
    await delete_session(request.cookies.get(SESSION_COOKIE))
    _clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=User)
async def me(user: Annotated[dict, Depends(get_current_user)]) -> User:
    return _user_model(user)