"""Password hashing and session verification for Phase B auth."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

_hasher = PasswordHasher()

DEMO_USER_EMAIL = "demo@gridmitra.com"
DEMO_USER_PASSWORD = "demo-pass-1234"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    if password_hash == "$argon2id$placeholder-never-used":
        return False
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError, ValueError):
        return False