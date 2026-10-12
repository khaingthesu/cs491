"""Tests for the lookup orchestrator with mocked HTTP (no network).

We stub httpx.AsyncClient.get so the three clients see canned RxClass /
RxNorm / openFDA responses, then assert the assembled SymptomResponse.
"""

from __future__ import annotations

import json

import httpx
import pytest

from app.services.lookup import lookup_symptom


class _FakeResponse:
    def __init__(self, payload: dict):
        self._payload = payload

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return self._payload


def _route(url: str, params: dict | None) -> dict:
    """Return a canned payload based on which endpoint is being called."""
    params = params or {}
    if "rxclass/class/byName.json" in url:
        return {
            "rxclassMinConceptList": {
                "rxclassMinConcept": [{"classId": "C1", "classType": "DISEASE"}]
            }
        }
    if "rxclass/classMembers.json" in url:
        return {
            "drugMemberGroup": {
                "drugMember": [
                    {"minConcept": {"rxcui": "161", "name": "acetaminophen"}}
                ]
            }
        }
    if "related.json" in url:
        return {
            "relatedGroup": {
                "conceptGroup": [
                    {
                        "tty": "BN",
                        "conceptProperties": [
                            {"name": "Tylenol", "rxcui": "202433"}
                        ],
                    }
                ]
            }
        }
    if "drug/label.json" in url:
        return {
            "results": [
                {
                    "indications_and_usage": ["For the temporary relief of headache."],
                    "warnings": ["Liver warning: contains acetaminophen."],
                }
            ]
        }
    return {}


@pytest.mark.asyncio
async def test_lookup_assembles_full_response(monkeypatch):
    async def fake_get(self, url, params=None):  # noqa: ANN001
        return _FakeResponse(_route(url, params))

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)

    result = await lookup_symptom("headache")

    assert result.symptom == "headache"
    assert result.disclaimer  # always present
    assert len(result.conditions) == 1

    condition = result.conditions[0]
    assert condition.name == "Headache"
    assert len(condition.drugs) == 1

    drug = condition.drugs[0]
    assert drug.ingredient == "acetaminophen"
    assert drug.rxcui == "161"
    assert [b.name for b in drug.brands] == ["Tylenol"]
    assert drug.label is not None
    assert "headache" in drug.label.indications.lower()
    assert "acetaminophen" in drug.label.warnings.lower()


@pytest.mark.asyncio
async def test_unknown_symptom_yields_no_conditions(monkeypatch):
    async def fake_get(self, url, params=None):  # noqa: ANN001
        return _FakeResponse({})

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)

    result = await lookup_symptom("teleportation sickness")
    assert result.conditions == []
    assert result.disclaimer
