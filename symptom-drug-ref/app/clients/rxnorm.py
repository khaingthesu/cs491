"""RxNorm client — expands a generic ingredient into its brand names.

RxNorm (NLM) normalizes drug names and relates ingredients to branded
products. We take an ingredient RXCUI and pull related brand-name concepts.

Docs: https://rxnav.nlm.nih.gov/RxNormAPIs.html
"""

from __future__ import annotations

from app.clients.base import HTTPClient


class RxNormClient(HTTPClient):
    """Query RxNorm for brand names related to an ingredient."""

    async def brand_names(self, rxcui: str) -> list[dict[str, str]]:
        """Return brand-name concepts (BN) related to ingredient ``rxcui``.

        Uses the ``related`` endpoint filtered to term type BN
        (brand name). Returns ``{"name": ..., "rxcui": ...}`` dicts.
        """
        data = await self.get_json(
            f"rxcui/{rxcui}/related.json", params={"tty": "BN"}
        )
        groups = data.get("relatedGroup", {}).get("conceptGroup", [])
        out: list[dict[str, str]] = []
        for group in groups:
            if group.get("tty") != "BN":
                continue
            for concept in group.get("conceptProperties", []):
                name = concept.get("name")
                bn_rxcui = concept.get("rxcui")
                if name:
                    out.append({"name": name, "rxcui": str(bn_rxcui) if bn_rxcui else ""})
        return out
