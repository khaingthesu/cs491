"""Application configuration.

Values come from environment variables (see .env.example). Keep this module
import-light so it can be used by clients, services, and tests alike.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """Runtime settings, resolved from the environment."""

    # Base URLs for the public data sources. Overridable for tests/mocking.
    rxnav_base_url: str = os.getenv("RXNAV_BASE_URL", "https://rxnav.nlm.nih.gov/REST")
    openfda_base_url: str = os.getenv("OPENFDA_BASE_URL", "https://api.fda.gov")

    # Optional openFDA API key — raises the rate limit. Anonymous works too.
    openfda_api_key: str | None = os.getenv("OPENFDA_API_KEY") or None

    # HTTP behaviour.
    http_timeout_seconds: float = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10"))
    http_max_retries: int = int(os.getenv("HTTP_MAX_RETRIES", "2"))

    # How many drugs to enrich with openFDA labels per symptom lookup.
    # Keeps response latency and upstream load bounded.
    max_labels_per_lookup: int = int(os.getenv("MAX_LABELS_PER_LOOKUP", "5"))

    # How many RxClass candidates to enrich+score BEFORE ranking/truncating.
    # Larger than max_labels_per_lookup so a good drug isn't cut pre-ranking.
    candidate_pool_size: int = int(os.getenv("CANDIDATE_POOL_SIZE", "15"))

    # Prominent, non-negotiable disclaimer attached to every response.
    disclaimer: str = (
        "This information is for educational purposes only and is NOT medical "
        "advice. It is not a diagnosis or a treatment recommendation. Always "
        "consult a licensed healthcare professional before taking any medication."
    )


def get_settings() -> Settings:
    """Return a fresh Settings instance (reads env at call time)."""
    return Settings()
