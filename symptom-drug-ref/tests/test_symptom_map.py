"""Unit tests for the symptom -> condition map. No network required."""

from app.services import symptom_map


def test_normalize_lowercases_and_strips():
    assert symptom_map.normalize("  Headache ") == "headache"


def test_known_symptom_maps_to_conditions():
    conditions = symptom_map.conditions_for("Headache")
    assert conditions == ["Headache"]


def test_case_insensitive_lookup():
    assert symptom_map.conditions_for("HEARTBURN") == [
        "Heartburn",
        "Gastroesophageal Reflux",
    ]


def test_unknown_symptom_returns_empty():
    assert symptom_map.conditions_for("teleportation sickness") == []


def test_known_symptoms_sorted_and_nonempty():
    symptoms = symptom_map.known_symptoms()
    assert symptoms == sorted(symptoms)
    assert "cough" in symptoms
