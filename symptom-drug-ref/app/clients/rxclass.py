"""RxClass client — maps a condition to drugs via the `may_treat` relation.

RxClass (part of RxNav/NLM) exposes drug classes and their member drugs. We
use it to find ingredients that *may treat* a given condition (a MeSH/MEDRT
class). This is the symptom->drug bridge.

Docs: https://rxnav.nlm.nih.gov/RxClassAPIs.html
"""

from __future__ import annotations

from app.clients.base import HTTPClient


class RxClassClient(HTTPClient):
    """Query RxClass for drug members of a condition class."""

    async def drugs_may_treat(self, condition: str) -> list[dict[str, str]]:
        """Return ingredients that may treat ``condition``.

        Strategy: resolve the condition to a class, then list its members
        under the ``may_treat`` relation. Returns a list of
        ``{"rxcui": ..., "name": ...}`` for ingredient-level concepts.
        """
        data = await self.get_json(
            "rxclass/class/byName.json", params={"className": condition}
        )
        classes = (
            data.get("rxclassMinConceptList", {}).get("rxclassMinConcept", [])
        )
        if not classes:
            return []

        class_id = classes[0].get("classId")
        rela_source = classes[0].get("classType", "DISEASE")

        members = await self.get_json(
            "rxclass/classMembers.json",
            params={
                "classId": class_id,
                "relaSource": "MEDRT",
                "rela": "may_treat",
                "relaSourceType": rela_source,
            },
        )
        drug_members = (
            members.get("drugMemberGroup", {}).get("drugMember", [])
        )
        out: list[dict[str, str]] = []
        for m in drug_members:
            concept = m.get("minConcept", {})
            rxcui = concept.get("rxcui")
            name = concept.get("name")
            if rxcui and name:
                out.append({"rxcui": str(rxcui), "name": name})
        return out
