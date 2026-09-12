import asyncio

from app.services.firebase_auth import _resolve_credential, verify_id_token


def test_resolve_credential_none_without_key(monkeypatch) -> None:
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_JSON", raising=False)
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_PATH", raising=False)
    # No conventional key file exists in the test environment.
    assert _resolve_credential() is None


def test_resolve_credential_ignores_invalid_env_json(monkeypatch) -> None:
    monkeypatch.setenv("FIREBASE_SERVICE_ACCOUNT_JSON", "not-json")
    assert _resolve_credential() is None


def test_verify_id_token_returns_none_when_unconfigured(monkeypatch) -> None:
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_JSON", raising=False)
    monkeypatch.delenv("FIREBASE_SERVICE_ACCOUNT_PATH", raising=False)
    # Unconfigured -> None, never raises, app keeps working as demo owner.
    assert asyncio.run(verify_id_token("fake-token")) is None
    assert asyncio.run(verify_id_token(None)) is None