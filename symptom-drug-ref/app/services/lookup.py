"""Lookup orchestration: symptom -> conditions -> drugs -> brands + labels.

Ties the three clients together behind one coroutine the API route calls.
Enrichment (brands, labels) is bounded by ``max_labels_per_lookup`` to keep
latency and upstream load in check — important on a constrained host.
"""

from __future__ import annotations

import asyncio

import httpx

from app.clients.openfda import OpenFDAClient
from app.clients.rxclass import RxClassClient
from app.clients.rxnorm import RxNormClient
from app.config import Settings, get_settings
from app.models import (
    BrandName,
    Condition,
    Drug,
    LabelSnippet,
    SymptomResponse,
)
from app.services import symptom_map
from app.services.ranking import rank_and_filter


async def lookup_symptom(
    symptom: str, *, settings: Settings | None = None
) -> SymptomResponse:
    """Resolve a symptom to conditions, drugs, brands, and label snippets."""
    settings = settings or get_settings()
    condition_names = symptom_map.conditions_for(symptom)

    response = SymptomResponse(
        symptom=symptom_map.normalize(symptom),
        conditions=[],
        disclaimer=settings.disclaimer,
    )
    if not condition_names:
        return response

    # One shared connection pool across all three clients.
    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as http:
        rxclass = RxClassClient(settings.rxnav_base_url, settings=settings, client=http)
        rxnorm = RxNormClient(settings.rxnav_base_url, settings=settings, client=http)
        openfda = OpenFDAClient(settings=settings, client=http)

        for cond_name in condition_names:
            drug_concepts = await rxclass.drugs_may_treat(cond_name)
            # Enrich a WIDER pool than we'll return, so ranking can pick the
            # best — truncating pre-ranking could cut a good drug.
            drug_concepts = drug_concepts[: settings.candidate_pool_size]

            drugs: list[Drug] = []
            for concept in drug_concepts:
                rxcui = concept["rxcui"]
                ingredient = concept["name"]

                brands_raw, label_raw = await asyncio.gather(
                    rxnorm.brand_names(rxcui),
                    openfda.label_snippet(ingredient),
                )

                brands = [
                    BrandName(name=b["name"], rxcui=b.get("rxcui") or None)
                    for b in brands_raw
                ]
                label = (
                    LabelSnippet(
                        indications=label_raw.get("indications"),
                        warnings=label_raw.get("warnings"),
                        product_type=label_raw.get("product_type"),
                    )
                    if label_raw
                    else None
                )
                drugs.append(
                    Drug(
                        rxcui=rxcui,
                        ingredient=ingredient,
                        brands=brands,
                        label=label,
                    )
                )

            # Rank by relevance, drop no-signal/supplement entries, then cap
            # to the configured response size.
            ranked = rank_and_filter(drugs)[: settings.max_labels_per_lookup]

            response.conditions.append(
                Condition(name=cond_name, source="manual-map", drugs=ranked)
            )

    return response
