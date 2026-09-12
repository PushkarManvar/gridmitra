"""Optional Firebase Admin verification.

The backend verifies Firebase ID tokens only when a service account is
configured (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH).
Without credentials, verification returns None and every request is treated as
the demo owner — keeping the offline demo fully working until Firebase is wired.
"""

import json
import os

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

_APP = None


def _firebase_app():
    global _APP
    if _APP is not None:
        return _APP
    env_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    credential = None
    if env_json:
        try:
            credential = credentials.Certificate(json.loads(env_json))
        except (ValueError, KeyError):
            credential = None
    else:
        cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
        if cred_path and os.path.exists(cred_path):
            credential = credentials.Certificate(cred_path)
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