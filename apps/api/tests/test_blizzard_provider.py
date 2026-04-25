import asyncio

import httpx

from app.providers.blizzard import BlizzardProvider


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code
        self.request = httpx.Request("GET", "https://example.test")

    def json(self):
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("request failed", request=self.request, response=self)


class FakeAsyncClient:
    def __init__(self, *args, response=None, **kwargs):
        self.response = response or FakeResponse({"ok": True})
        self.calls = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url, params=None, headers=None):
        self.calls.append({"url": url, "params": params, "headers": headers})
        return self.response


def test_authorized_get_uses_bearer_token_and_namespace(monkeypatch):
    payload = {"name": "Test Guild"}
    fake_client = FakeAsyncClient(response=FakeResponse(payload))

    monkeypatch.setattr("app.providers.blizzard.httpx.AsyncClient", lambda *args, **kwargs: fake_client)

    provider = BlizzardProvider(
        {
            "enabled": True,
            "region": "us",
            "client_id": "client-id",
            "client_secret": "client-secret",
        }
    )
    monkeypatch.setattr(provider, "get_app_access_token", lambda: asyncio.sleep(0, result="token-123"))

    result = asyncio.run(provider._authorized_get("us", "/profile/wow/character/stormrage/test"))

    assert result == payload
    assert fake_client.calls == [
        {
            "url": "https://us.api.blizzard.com/profile/wow/character/stormrage/test",
            "params": {"namespace": "profile-us", "locale": "en_US"},
            "headers": {"Authorization": "Bearer token-123"},
        }
    ]


def test_optional_profile_get_returns_none_for_404(monkeypatch):
    fake_client = FakeAsyncClient(response=FakeResponse({"detail": "not found"}, status_code=404))

    monkeypatch.setattr("app.providers.blizzard.httpx.AsyncClient", lambda *args, **kwargs: fake_client)

    provider = BlizzardProvider(
        {
            "enabled": True,
            "region": "eu",
            "client_id": "client-id",
            "client_secret": "client-secret",
        }
    )
    monkeypatch.setattr(provider, "get_app_access_token", lambda: asyncio.sleep(0, result="token-123"))

    result = asyncio.run(provider._optional_profile_get("eu", "/profile/wow/character/tarren-mill/test/equipment"))

    assert result is None
