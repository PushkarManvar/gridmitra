"""Optional Firebase Admin verification.

The backend verifies Firebase ID tokens only when a service account is
available. Discovery order:

1. `FIREBASE_SERVICE_ACCOUNT_JSON` env (the JSON as a string)
2. `FIREBASE_SERVICE_ACCOUNT_PATH` env (path to the JSON file)
3. `/firebase/serviceAccountKey.json` (container mount of ./firebase)
4. `./firebase/serviceAccountKey.json` (repo root)

Without any of these, verification returns None and every request is treated as
the demo owner — keeping the offline demo fully working until a key is dropped
into `firebase/`.
"""

import json
import os
from pathlib import Path

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

_APP = None

CONVENTIONAL_PATHS = [
    Path("/firebase/serviceAccountKey.json"),
    Path("./firebase/serviceAccountKey.json"),
]


def _resolve_credential():
    env_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if env_json:
        try:
            return credentials.Certificate(json.loads(env_json))
        except (ValueError, KeyError):
            return None
    env_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
    candidates = [Path(env_path)] if env_path else []
    candidates += CONVENTIONAL_PATHS
    for candidate in candidates:
        if candidate.exists():
            try:
                return credentials.Certificate(str(candidate))
            except (ValueError, KeyError):
                continue
    return None


def _firebase_app():
    global _APP
    if _APP is not None:
        return _APP
    credential = _resolve_credential()
    if credential is None:
        return None
    _APP = firebase_admin.initialize_app(credential)
    return _APP


async def verify_id_token(id_token: str | None) -> dict | None:
    """Return Firebase claims {uid, email, name} or None (invalid/unconfigured)."""
    if not id_token:
        return None
    app = _firebase_app()
    if app is None:
        return None
    try:
        decoded = firebase_auth.verify_id_token(id_token, app=app)
        return {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "name": decoded.get("name"),
        }
    except Exception:
        return None