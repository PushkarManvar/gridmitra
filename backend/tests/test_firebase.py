import asyncio

from app.services.firebase_auth import _resolve_credential, verify_id_token


def _no_key(monkeypatch) -> None:
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_JSON", raising=False)
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_PATH", raising=False)
    # Conventional paths may hold a real key on a configured machine; clear them.
    monkeypatch.setattr("app.services.firebase_auth.CONVENTIONAL_PATHS", [])


def test_resolve_credential_none_without_key(monkeypatch) -> None:
    _no_key(monkeypatch)
    assert _resolve_credential() is None


def test_resolve_credential_ignores_invalid_env_json(monkeypatch) -> None:
    _no_key(monkeypatch)
    monkeypatch.setenv("FIREBASE_SERVICE_ACCOUNT_JSON", "not-json")
    assert _resolve_credential() is None


def test_verify_id_token_returns_none_when_unconfigured(monkeypatch) -> None:
    _no_key(monkeypatch)
    # Unconfigured -> None, never raises, app keeps working as demo owner.
    assert asyncio.run(verify_id_token("fake-token")) is None
    assert asyncio.run(verify_id_token(None)) is None