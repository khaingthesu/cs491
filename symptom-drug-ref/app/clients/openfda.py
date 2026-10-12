"""openFDA client — fetches FDA label snippets for a drug.

openFDA exposes Structured Product Labels (SPL). We query the drug/label
endpoint by generic name and return the 'indications and usage' and
'warnings' sections.

Docs: https://open.fda.gov/apis/drug/label/
"""

from __future__ import annotations

from typing import Any

from app.clients.base import HTTPClient
from app.config import Settings, get_settings


def _first(value: Any) -> str | None:
    """openFDA label fields are arrays of strings; take the first, trimmed."""
    if isinstance(value, list) and value:
        text = str(value[0]).strip()
        return text or None
    if isinstance(value, str):
        return value.strip() or None
    return None


class OpenFDAClient(HTTPClient):
    """Query openFDA drug label endpoint by generic name."""

    def __init__(self, *args: Any, settings: Settings | None = None, **kwargs: Any):
        settings = settings or get_settings()
        super().__init__(settings.openfda_base_url, settings=settings, **kwargs)
        self._api_key = settings.openfda_api_key

    async def label_snippet(self, generic_name: str) -> dict[str, str | None] | None:
        """Return label fields for ``generic_name`` or None if unavailable.

        Returns a dict with ``indications``, ``warnings``, and ``product_type``
        (e.g. 'HUMAN OTC DRUG', 'HUMAN PRESCRIPTION DRUG'); product_type drives
        ranking so we can tell real drugs from supplements/homeopathics.
        """
        params: dict[str, Any] = {
            "search": f'openfda.generic_name:"{generic_name}"',
            "limit": 1,
        }
        if self._api_key:
            params["api_key"] = self._api_key

        try:
            data = await self.get_json("drug/label.json", params=params)
        except Exception:
            # Label coverage is spotty; a miss is not fatal to the lookup.
            return None

        results = data.get("results", [])
        if not results:
            return None
        label = results[0]
        indications = _first(label.get("indications_and_usage"))
        warnings = _first(label.get("warnings"))
        product_type = _first(label.get("openfda", {}).get("product_type"))
        if indications is None and warnings is None and product_type is None:
            return None
        return {
            "indications": indications,
            "warnings": warnings,
            "product_type": product_type,
        }
