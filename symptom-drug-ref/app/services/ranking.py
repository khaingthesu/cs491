"""Rank and filter the candidate drug list so output reads like a formulary.

RxClass's ``may_treat`` relation is broad: it returns real analgesics next to
supplements and homeopathics (e.g. octopamine ranking above naproxen for
"headache"). We re-order and optionally drop candidates using signals we
already fetch — no hardcoded per-drug blocklist.

Signals, highest-trust first:
  * openFDA ``product_type`` — HUMAN OTC/PRESCRIPTION DRUG is a strong
    positive; its absence (or a homeopathic/supplement marker) is a negative.
  * Presence of brand-name products in RxNorm — marketed drugs usually have
    them; obscure ingredients usually don't.
  * Presence of any usable FDA label at all.

The scorer is a pure function so it is trivially unit-testable offline.
"""

from __future__ import annotations

from app.models import Drug

# openFDA product_type values we treat as genuine human drugs.
_DRUG_PRODUCT_TYPES = {
    "HUMAN OTC DRUG",
    "HUMAN PRESCRIPTION DRUG",
}

# Substrings in product_type / ingredient that mark a non-formulary item.
_DEMOTE_MARKERS = (
    "homeopathic",
    "dietary supplement",
    "supplement",
)


def score_drug(drug: Drug) -> int:
    """Return a relevance score; higher ranks nearer the top of the list.

    Pure function — depends only on the already-populated ``drug`` fields.
    """
    score = 0
    label = drug.label
    product_type = (label.product_type or "") if label else ""
    pt_upper = product_type.upper()
    name_lower = drug.ingredient.lower()

    # Strongest signal: a real FDA human-drug product type.
    if pt_upper in _DRUG_PRODUCT_TYPES:
        score += 100
    elif label is not None:
        # Has a label but not a recognized human-drug type — mild positive.
        score += 20

    # Marketed brand names indicate a real, dispensable product.
    if drug.brands:
        score += 30 + min(len(drug.brands), 5)

    # Any indications text is a small positive (it treats *something*).
    if label and label.indications:
        score += 10

    # Demote supplements / homeopathics by marker in type or ingredient name.
    haystack = f"{pt_upper.lower()} {name_lower}"
    if any(marker in haystack for marker in _DEMOTE_MARKERS):
        score -= 80

    return score


def rank_and_filter(drugs: list[Drug], *, drop_below: int = 1) -> list[Drug]:
    """Sort drugs by descending score and drop those scoring below ``drop_below``.

    ``drop_below`` defaults to 1 so a candidate with no supporting signal at
    all (no label, no brands) is removed, while anything with a single weak
    positive survives. Ties keep original (RxClass) order via stable sort.
    """
    scored = [(score_drug(d), d) for d in drugs]
    kept = [(s, d) for (s, d) in scored if s >= drop_below]
    kept.sort(key=lambda pair: pair[0], reverse=True)
    return [d for (_s, d) in kept]
