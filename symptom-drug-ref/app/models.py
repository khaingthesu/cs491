"""Pydantic models for the API's response shapes.

These describe what we return to the client, not a database schema. The data
flow is: symptom -> condition(s) -> drugs -> brands + label snippets.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class BrandName(BaseModel):
    """A brand name mapped to a generic ingredient via RxNorm."""

    name: str = Field(..., description="Brand name, e.g. 'Tylenol'")
    rxcui: str | None = Field(None, description="RxNorm concept unique identifier")


class LabelSnippet(BaseModel):
    """A short excerpt from an FDA structured product label (openFDA)."""

    indications: str | None = Field(
        None, description="'Indications and usage' text from the label"
    )
    warnings: str | None = Field(None, description="Warnings text from the label")
    product_type: str | None = Field(
        None,
        description="openFDA product_type, e.g. 'HUMAN OTC DRUG' — used for ranking",
    )
    source: str = Field("openFDA", description="Provenance of the snippet")


class Drug(BaseModel):
    """A drug associated with a condition, with brand and label enrichment."""

    rxcui: str = Field(..., description="RxNorm concept unique identifier")
    ingredient: str = Field(..., description="Generic ingredient name")
    brands: list[BrandName] = Field(default_factory=list)
    label: LabelSnippet | None = None


class Condition(BaseModel):
    """A condition a symptom maps to, plus the drugs that may treat it."""

    name: str = Field(..., description="Condition name, e.g. 'headache'")
    source: str = Field(
        "manual-map", description="How the symptom->condition link was derived"
    )
    drugs: list[Drug] = Field(default_factory=list)


class SymptomResponse(BaseModel):
    """Top-level response for GET /symptom/{name}."""

    symptom: str
    conditions: list[Condition] = Field(default_factory=list)
    disclaimer: str
