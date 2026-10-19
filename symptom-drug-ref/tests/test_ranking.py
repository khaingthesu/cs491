"""Unit tests for drug ranking/filtering. Pure functions, no network."""

from app.models import BrandName, Drug, LabelSnippet
from app.services.ranking import rank_and_filter, score_drug


def _drug(rxcui, ingredient, *, brands=(), indications=None, product_type=None):
    label = None
    if indications is not None or product_type is not None:
        label = LabelSnippet(indications=indications, product_type=product_type)
    return Drug(
        rxcui=rxcui,
        ingredient=ingredient,
        brands=[BrandName(name=b) for b in brands],
        label=label,
    )


def test_real_otc_drug_outscores_supplement():
    naproxen = _drug(
        "142442",
        "naproxen sodium",
        brands=["Aleve", "Anaprox"],
        indications="relieves minor aches and headache",
        product_type="HUMAN OTC DRUG",
    )
    octopamine = _drug(
        "1311141",
        "octopamine",
        indications="relief of occasional headache due to dietary supplement use",
    )
    assert score_drug(naproxen) > score_drug(octopamine)


def test_supplement_marker_is_demoted():
    supp = _drug("9", "vitamin C", product_type="DIETARY SUPPLEMENT")
    # Demotion (-80) should overwhelm the weak label positive.
    assert score_drug(supp) < 0


def test_rank_and_filter_orders_and_drops():
    good = _drug(
        "1",
        "ibuprofen",
        brands=["Advil"],
        indications="pain",
        product_type="HUMAN OTC DRUG",
    )
    weak = _drug("2", "mystery ingredient")  # no label, no brands -> score 0
    homeopathic = _drug("3", "arnica", product_type="HOMEOPATHIC DRUG")

    result = rank_and_filter([weak, homeopathic, good])

    # 'good' survives and ranks first; no-signal and homeopathic are dropped.
    assert [d.ingredient for d in result] == ["ibuprofen"]


def test_prescription_type_counts_as_real_drug():
    rx = _drug("4", "sumatriptan", product_type="HUMAN PRESCRIPTION DRUG")
    assert score_drug(rx) >= 100


def test_stable_order_for_equal_scores():
    a = _drug("1", "alpha", brands=["A"], product_type="HUMAN OTC DRUG")
    b = _drug("2", "bravo", brands=["B"], product_type="HUMAN OTC DRUG")
    # Equal scores -> original order preserved.
    assert [d.ingredient for d in rank_and_filter([a, b])] == ["alpha", "bravo"]
