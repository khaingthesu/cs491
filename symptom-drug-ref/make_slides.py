"""Generate a PowerPoint deck from the 14-step build guide.

Plain and self-contained: run `python make_slides.py` and it writes
`Symptom-Drug-Reference-Build-Steps.pptx` next to this script. Edit the
SLIDES list below to change content, then re-run.
"""

from __future__ import annotations

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# ---- simple theme -----------------------------------------------------------
TEAL = RGBColor(0x0F, 0x76, 0x6E)      # headings / title band
DARK = RGBColor(0x1F, 0x2A, 0x37)      # body text
GREY = RGBColor(0x5B, 0x66, 0x70)      # subtitles
LIGHT = RGBColor(0xF3, 0xF6, 0xF8)     # slide-number bg

# ---- content ----------------------------------------------------------------
# Each content slide is (title, subtitle, [bullet, ...]).
SLIDES: list[tuple[str, str, list[str]]] = [
    (
        "Step 0 — The Big Picture",
        "One question, answered in a chain",
        [
            "Goal: for a symptom, show associated drugs + names + label info.",
            "Chain: symptom → condition → drugs → brand names + label text → ranked result.",
            "Three free US government APIs do the heavy lifting:",
            "   • RxClass — which drugs may treat a condition?",
            "   • RxNorm — what are a drug's brand names?",
            "   • openFDA — what's on the drug's FDA label?",
            "We never store drug data — we ask these APIs each time.",
        ],
    ),
    (
        "Step 1 — Folder & Environment",
        "A private Python just for this project",
        [
            "mkdir symptom-drug-ref && cd symptom-drug-ref",
            "python3 -m venv .venv   (a 'virtual environment')",
            "source .venv/bin/activate   (Windows: .venv\\Scripts\\activate)",
            "mkdir -p app/clients app/services tests",
            "Why a venv? It keeps this project's packages separate from system Python.",
        ],
    ),
    (
        "Step 2 — Install the Packages",
        "requirements.txt lists them; pip installs them",
        [
            "fastapi — the web framework (defines the URLs)",
            "uvicorn — the server that runs FastAPI",
            "httpx — makes the HTTP calls to the drug APIs",
            "pydantic — defines + validates the data shapes",
            "pytest / respx — run tests with fake HTTP (no internet)",
            "Install all at once:  pip install -r requirements.txt",
            "Pin versions with ==  so it behaves the same next month.",
        ],
    ),
    (
        "Step 3 — Try the APIs by Hand First",
        "See the real JSON before writing any code",
        [
            "Open each URL in a browser and read the response:",
            "RxClass: .../rxclass/class/byName.json?className=Headache",
            "RxNorm:  .../rxcui/142442/related.json?tty=BN   (BN = brand name)",
            "openFDA: api.fda.gov/drug/label.json?search=openfda.generic_name:...",
            "The JSON is deeply nested — that's why client code mostly 'digs' into dicts.",
            "RXCUI = a stable ID number for a drug concept (like a barcode).",
        ],
    ),
    (
        "Step 4 — Settings (config.py)",
        "All configurable values in one place",
        [
            "API base URLs, timeouts, retry count, and the legal disclaimer.",
            "Read from environment variables with sensible defaults.",
            "@dataclass(frozen=True) — a small, read-only value holder.",
            "os.getenv('NAME', 'default') — overridable without editing code.",
            "The disclaimer ('NOT medical advice') is attached to every response.",
        ],
    ),
    (
        "Step 5 — Data Shapes (models.py)",
        "Decide what the answer looks like first",
        [
            "pydantic models describe a shape AND validate it automatically.",
            "Nesting mirrors the chain:",
            "   SymptomResponse → Conditions → Drugs → BrandNames + LabelSnippet",
            "Return a model from an endpoint → FastAPI makes the JSON + docs for free.",
        ],
    ),
    (
        "Step 6 — Shared HTTP Helper (clients/base.py)",
        "Write the GET-and-parse logic once",
        [
            "All three APIs are 'send a GET, get JSON back' — don't repeat it 3×.",
            "Adds a timeout and a retry loop (public APIs occasionally hiccup).",
            "raise_for_status() turns an HTTP error into a Python exception.",
            "async/await: if a function talks to the network, it's async.",
            "The three clients inherit from this and add only their own bit.",
        ],
    ),
    (
        "Step 7 — The Three API Clients",
        "Each is small: build URL, call, dig out the data",
        [
            "rxclass.py — condition → list of drugs (the 'may_treat' relation).",
            "rxnorm.py — drug RXCUI → brand names (filter to tty = BN).",
            "openfda.py — drug name → label (indications, warnings, product_type).",
            ".get('key', {}) everywhere = 'this key, or empty if missing' (no crashes).",
            "openFDA returns None on a miss — not every drug has a label (degrade gracefully).",
        ],
    ),
    (
        "Step 8 — Symptom → Condition Map",
        "A symptom isn't drug data; bridge it to a condition",
        [
            "Start with a hand-written dictionary — honest and easy to read.",
            "'headache' → 'Headache';  'heartburn' → 'Heartburn' + 'GERD'.",
            "normalize() makes 'Headache', 'HEADACHE', ' headache ' all match.",
            "Later you can replace it with a medical vocabulary (MeSH/SNOMED).",
        ],
    ),
    (
        "Step 9 — Tie It Together (lookup.py)",
        "The conductor — the only file using all 3 clients",
        [
            "Reads as the Step-0 chain, in code.",
            "One shared httpx client is passed to all three (one connection pool).",
            "asyncio.gather() fetches brands + label at the same time (≈ half the wait).",
            "Enrich a WIDE pool (15), THEN rank, THEN cut to 5 —",
            "   so a good drug at position 8 isn't thrown away before scoring.",
        ],
    ),
    (
        "Step 10 — The Web Endpoints (main.py)",
        "FastAPI turns plain functions into URLs",
        [
            "GET /            → service info + disclaimer",
            "GET /symptoms    → the list of known symptoms",
            "GET /symptom/{name} → ranked drugs + brands + labels",
            "{name} in the path becomes the function's argument.",
            "response_model=... powers validation + the auto docs page.",
        ],
    ),
    (
        "Step 11 — Run It",
        "Start the server and try it",
        [
            "uvicorn app.main:app --reload",
            "('in app/main.py, use the variable app'; --reload restarts on save)",
            "Open http://127.0.0.1:8000/docs → a clickable page for every endpoint.",
            "Or: curl http://127.0.0.1:8000/symptom/headache",
        ],
    ),
    (
        "Step 12 — Ranking: Drop the Supplements",
        "RxClass can't tell medicine from supplements — so we score",
        [
            "Problem seen live: octopamine (a supplement) outranked naproxen (Aleve).",
            "Don't hardcode a blocklist — score on data we already fetched:",
            "   +100  openFDA says HUMAN OTC / PRESCRIPTION DRUG",
            "   +30   has real brand names in RxNorm",
            "   −80   label/name says 'supplement' or 'homeopathic'",
            "score_drug() is a PURE function → trivial to test, one place to tune.",
        ],
    ),
    (
        "Step 13 — Tests",
        "Fast, offline, no internet",
        [
            "Tests feed FAKE API responses and check the assembled answer.",
            "Pure functions (symptom_map, ranking) need no faking at all.",
            "The full pipeline test replaces httpx's GET with a canned response.",
            "Run everything:  pytest -q   → green = all pieces connect correctly.",
        ],
    ),
    (
        "Step 14 — Where to Go Next",
        "Small, understood steps — the opposite of vibe coding",
        [
            "1. Add more symptoms (just extend the dictionary).",
            "2. Cache responses so repeated lookups are instant.",
            "3. Add a tiny HTML page so a non-programmer can use it.",
            "4. Match label indications to the condition (cut false positives).",
            "5. Move the map into a database (SQLite) once it grows.",
            "Pick ONE at a time.",
        ],
    ),
]


def _set_text(frame, text, size, color, bold=False, align=PP_ALIGN.LEFT):
    frame.text = text
    p = frame.paragraphs[0]
    p.alignment = align
    run = p.runs[0]
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def _band(slide, prs, color, height_in):
    """Draw a colored rectangle band across the top of the slide."""
    from pptx.enum.shapes import MSO_SHAPE

    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(height_in)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    shape.shadow.inherit = False
    return shape


def build() -> str:
    prs = Presentation()
    prs.slide_width = Inches(13.333)   # 16:9 widescreen
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]       # fully blank layout

    # ---- Title slide --------------------------------------------------------
    s = prs.slides.add_slide(blank)
    _band(s, prs, TEAL, 7.5)           # full teal background
    t = s.shapes.add_textbox(Inches(0.8), Inches(2.4), Inches(11.7), Inches(1.6))
    _set_text(t.text_frame, "Symptom → Drug Reference", 44, RGBColor(0xFF, 0xFF, 0xFF),
              bold=True, align=PP_ALIGN.CENTER)
    sub = s.shapes.add_textbox(Inches(0.8), Inches(4.0), Inches(11.7), Inches(1.4))
    tf = sub.text_frame
    tf.word_wrap = True
    _set_text(tf, "Building it step by step — a plain, understand-every-line guide",
              22, RGBColor(0xDD, 0xEE, 0xEC), align=PP_ALIGN.CENTER)
    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    r = p2.add_run()
    r.text = "Educational tool — NOT medical advice."
    r.font.size = Pt(15)
    r.font.italic = True
    r.font.color.rgb = RGBColor(0xBF, 0xDD, 0xDA)

    # ---- Content slides -----------------------------------------------------
    for i, (title, subtitle, bullets) in enumerate(SLIDES, start=1):
        s = prs.slides.add_slide(blank)
        _band(s, prs, TEAL, 1.25)

        # Title (on the band)
        tb = s.shapes.add_textbox(Inches(0.6), Inches(0.18), Inches(12.1), Inches(0.95))
        _set_text(tb.text_frame, title, 28, RGBColor(0xFF, 0xFF, 0xFF), bold=True)

        # Subtitle
        sb = s.shapes.add_textbox(Inches(0.6), Inches(1.4), Inches(12.1), Inches(0.5))
        _set_text(sb.text_frame, subtitle, 17, GREY, bold=False)

        # Bullets
        body = s.shapes.add_textbox(Inches(0.7), Inches(2.05), Inches(11.9), Inches(5.0))
        bf = body.text_frame
        bf.word_wrap = True
        for j, line in enumerate(bullets):
            para = bf.paragraphs[0] if j == 0 else bf.add_paragraph()
            indented = line.startswith("   ")
            run = para.add_run()
            run.text = ("• " + line.strip()) if not indented else ("    " + line.strip())
            run.font.size = Pt(16 if not indented else 15)
            run.font.color.rgb = DARK
            para.space_after = Pt(8)

        # Slide number
        num = s.shapes.add_textbox(Inches(12.4), Inches(7.0), Inches(0.8), Inches(0.4))
        _set_text(num.text_frame, str(i), 11, GREY, align=PP_ALIGN.RIGHT)

    out = "Symptom-Drug-Reference-Build-Steps.pptx"
    prs.save(out)
    return out


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path}")
