"""Shared async HTTP client base.

Wraps httpx with a timeout, bounded retries, and JSON parsing so each source
client stays small. All source clients share one AsyncClient when passed in.
"""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

from app.config import Settings, get_settings


class HTTPClient:
    """Thin async wrapper over httpx with retry + JSON helpers."""

    def __init__(
        self,
        base_url: str,
        *,
        settings: Settings | None = None,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._base_url = base_url.rstrip("/")
        # If a client is injected (tests, shared pool) we don't own its lifecycle.
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            timeout=self._settings.http_timeout_seconds
        )

    async def get_json(
        self, path: str, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """GET {base}/{path} and return parsed JSON, with bounded retries."""
        url = f"{self._base_url}/{path.lstrip('/')}"
        last_exc: Exception | None = None
        for attempt in range(self._settings.http_max_retries + 1):
            try:
                resp = await self._client.get(url, params=params)
                resp.raise_for_status()
                return resp.json()
            except (httpx.HTTPError, ValueError) as exc:
                last_exc = exc
                if attempt < self._settings.http_max_retries:
                    # Simple linear backoff; upstreams are public and polite.
                    await asyncio.sleep(0.25 * (attempt + 1))
        assert last_exc is not None
        raise last_exc

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def __aenter__(self) -> "HTTPClient":
        return self

    async def __aexit__(self, *_exc: object) -> None:
        await self.aclose()
