"""FastAPI application — the HTTP surface.

Endpoints:
  GET /                  -> service metadata + disclaimer
  GET /symptoms          -> list of supported symptoms (this slice)
  GET /symptom/{name}    -> drugs + brands + label snippets for a symptom
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException

from app.config import get_settings
from app.models import SymptomResponse
from app.services import symptom_map
from app.services.lookup import lookup_symptom

app = FastAPI(
    title="Symptom-Drug Reference",
    version="0.1.0",
    description=(
        "Educational drug-information lookup. NOT medical advice. "
        "Maps a symptom to associated conditions and the drugs indicated "
        "for them, using public US federal data (RxNorm, RxClass, openFDA)."
    ),
)


@app.get("/")
async def root() -> dict[str, str]:
    settings = get_settings()
    return {
        "service": "symptom-drug-ref",
        "version": "0.1.0",
        "disclaimer": settings.disclaimer,
    }


@app.get("/symptoms")
async def list_symptoms() -> dict[str, list[str]]:
    return {"symptoms": symptom_map.known_symptoms()}


@app.get("/symptom/{name}", response_model=SymptomResponse)
async def get_symptom(name: str) -> SymptomResponse:
    if not symptom_map.conditions_for(name):
        raise HTTPException(
            status_code=404,
            detail=(
                f"Symptom '{name}' is not in the supported set. "
                f"See GET /symptoms for the current list."
            ),
        )
    return await lookup_symptom(name)
