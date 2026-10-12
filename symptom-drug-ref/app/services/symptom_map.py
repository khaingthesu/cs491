"""Symptom -> condition mapping (first-milestone version).

Symptoms are not drug data, so we bridge them to condition names that RxClass
understands. For the first vertical slice this is a small curated table of
common symptoms. Later this can be replaced by a MeSH/SNOMED lookup.

Each symptom maps to one or more condition class names that RxClass's
`class/byName` endpoint can resolve.
"""

from __future__ import annotations

# Normalized symptom (lowercase) -> list of RxClass-resolvable condition names.
SYMPTOM_TO_CONDITIONS: dict[str, list[str]] = {
    "headache": ["Headache"],
    "heartburn": ["Heartburn", "Gastroesophageal Reflux"],
    "cough": ["Cough"],
    "fever": ["Fever"],
    "nausea": ["Nausea"],
    "allergy": ["Rhinitis, Allergic"],
    "pain": ["Pain"],
    "diarrhea": ["Diarrhea"],
    "constipation": ["Constipation"],
    "insomnia": ["Sleep Initiation and Maintenance Disorders"],
}


def normalize(symptom: str) -> str:
    """Lowercase + strip so lookups are forgiving of casing/whitespace."""
    return symptom.strip().lower()


def conditions_for(symptom: str) -> list[str]:
    """Return condition names for a symptom, or [] if unmapped."""
    return SYMPTOM_TO_CONDITIONS.get(normalize(symptom), [])


def known_symptoms() -> list[str]:
    """Return the sorted list of symptoms this slice supports."""
    return sorted(SYMPTOM_TO_CONDITIONS)
