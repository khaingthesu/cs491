# Build Guide — Symptom → Drug Reference

This guide builds the app **from zero**, one small step at a time. Each step
explains *what* you're writing and *why*, so you understand the whole thing
instead of copying code. Nothing here is clever or "fancy" — it's deliberately
plain Python.

Work through it top to bottom. By the end you'll have the same app, but you'll
know how every piece works.

---

## Table of contents

0. [The big picture](#step-0--the-big-picture)
1. [Set up the folder and environment](#step-1--set-up-the-folder-and-environment)
2. [Install the packages](#step-2--install-the-packages)
3. [Try the real APIs by hand first](#step-3--try-the-real-apis-by-hand-first)
4. [Settings (`config.py`)](#step-4--settings-configpy)
5. [Data shapes (`models.py`)](#step-5--data-shapes-modelspy)
6. [The shared HTTP helper (`clients/base.py`)](#step-6--the-shared-http-helper-clientsbasepy)
7. [The three API clients](#step-7--the-three-api-clients)
8. [Symptom → condition map (`services/symptom_map.py`)](#step-8--symptom--condition-map-servicessymptom_mappy)
9. [Tie it together (`services/lookup.py`)](#step-9--tie-it-together-serviceslookuppy)
10. [The web endpoints (`main.py`)](#step-10--the-web-endpoints-mainpy)
11. [Run it](#step-11--run-it)
12. [Ranking: drop the supplements](#step-12--ranking-drop-the-supplements)
13. [Tests](#step-13--tests)
14. [Where to go next](#step-14--where-to-go-next)

---

## Step 0 — The big picture

The app answers one question: **"For this symptom, what drugs are associated
with treating it, and what are they called and what's on their label?"**

It does that in a chain. Follow the arrows:

```
   "headache"
      │  (symptom_map.py: a hand-written lookup)
      ▼
   "Headache"  ← a condition name RxClass understands
      │  (rxclass.py: ask "what may_treat this?")
      ▼
   [naproxen sodium, butalbital, ...]  ← generic drugs
      │                 │
      │ (rxnorm.py)     │ (openfda.py)
      ▼                 ▼
  brand names      label text
  "Aleve",...      indications + warnings
      │                 │
      └──────┬──────────┘
             ▼
   (ranking.py: sort real drugs up, drop supplements)
             ▼
   JSON response to the user
```

Three outside services do the heavy lifting. We never *store* drug data — we
*ask* these free government APIs each time:

- **RxClass** — "which drugs may treat condition X?"
- **RxNorm** — "what are the brand names of drug Y?"
- **openFDA** — "what's on the FDA label for drug Y?"

Our job is just to call them in the right order and tidy up the answer.

---

## Step 1 — Set up the folder and environment

A **virtual environment** (`venv`) is a private copy of Python for this project
so its packages don't mix with your system Python. Always use one.

```bash
mkdir symptom-drug-ref
cd symptom-drug-ref
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
```

When it's active your prompt shows `(.venv)`. To leave it later: `deactivate`.

Now make the folders you'll fill in:

```bash
mkdir -p app/clients app/services tests
```

---

## Step 2 — Install the packages

Create `requirements.txt` with exactly this:

```
fastapi==0.115.5
uvicorn[standard]==0.32.1
httpx==0.27.2
pydantic==2.9.2
pydantic-settings==2.6.1
python-dotenv==1.0.1

# dev / test
pytest==8.3.3
pytest-asyncio==0.24.0
respx==0.21.1
```

**Why pinned versions (`==`)?** So the app behaves the same next month as it
does today. Un-pinned versions are a classic source of "it worked yesterday"
bugs.

Install them all at once:

```bash
pip install -r requirements.txt
```

---

## Step 3 — Try the real APIs by hand first

Before writing *any* client code, call the APIs yourself. This is the single
best way to understand what your code will receive. Open them in a browser:

1. **RxClass — find the condition's class and its drugs.**
   What may treat a headache?
   <https://rxnav.nlm.nih.gov/REST/rxclass/class/byName.json?className=Headache>
   Look at the JSON. You'll see a `classId`. Then the members:
   <https://rxnav.nlm.nih.gov/REST/rxclass/classMembers.json?classId=D006261&relaSource=MEDRT&rela=may_treat>

2. **RxNorm — brand names for a drug.** Naproxen sodium's RXCUI is `142442`:
   <https://rxnav.nlm.nih.gov/REST/rxcui/142442/related.json?tty=BN>
   (`tty=BN` means "brand name".)

3. **openFDA — the label.**
   <https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22naproxen+sodium%22&limit=1>

Spend ten minutes clicking around these. Notice the JSON is deeply nested —
that's why our client code spends most of its lines just reaching into
dictionaries to pull out the parts we want.

> **RXCUI** = RxNorm Concept Unique Identifier. It's a stable number for a drug
> concept, like a barcode. We pass it between RxClass and RxNorm.

---

## Step 4 — Settings (`config.py`)

Everything configurable lives in one place: the API URLs, timeouts, and the
legal disclaimer. We read them from environment variables so you can change
behavior without editing code.

`app/config.py`:

```python
from __future__ import annotations
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    rxnav_base_url: str = os.getenv("RXNAV_BASE_URL", "https://rxnav.nlm.nih.gov/REST")
    openfda_base_url: str = os.getenv("OPENFDA_BASE_URL", "https://api.fda.gov")
    openfda_api_key: str | None = os.getenv("OPENFDA_API_KEY") or None
    http_timeout_seconds: float = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10"))
    http_max_retries: int = int(os.getenv("HTTP_MAX_RETRIES", "2"))
    max_labels_per_lookup: int = int(os.getenv("MAX_LABELS_PER_LOOKUP", "5"))
    candidate_pool_size: int = int(os.getenv("CANDIDATE_POOL_SIZE", "15"))
    disclaimer: str = (
        "This information is for educational purposes only and is NOT medical "
        "advice. It is not a diagnosis or a treatment recommendation. Always "
        "consult a licensed healthcare professional before taking any medication."
    )

def get_settings() -> Settings:
    return Settings()
```

**New ideas here:**
- `@dataclass(frozen=True)` — a tiny class that just holds values and can't be
  changed after creation. Clean and safe.
- `os.getenv("NAME", "default")` — "read environment variable NAME, or use this
  default." That's how settings become overridable.

---

## Step 5 — Data shapes (`models.py`)

Before writing logic, decide **what the answer looks like**. Pydantic models
are classes that describe a shape *and* validate it automatically.

`app/models.py`:

```python
from __future__ import annotations
from pydantic import BaseModel, Field

class BrandName(BaseModel):
    name: str
    rxcui: str | None = None

class LabelSnippet(BaseModel):
    indications: str | None = None
    warnings: str | None = None
    product_type: str | None = None     # e.g. "HUMAN OTC DRUG" — used for ranking
    source: str = "openFDA"

class Drug(BaseModel):
    rxcui: str
    ingredient: str
    brands: list[BrandName] = Field(default_factory=list)
    label: LabelSnippet | None = None

class Condition(BaseModel):
    name: str
    source: str = "manual-map"
    drugs: list[Drug] = Field(default_factory=list)

class SymptomResponse(BaseModel):
    symptom: str
    conditions: list[Condition] = Field(default_factory=list)
    disclaimer: str
```

Read these bottom-up: a `SymptomResponse` has `Condition`s, each has `Drug`s,
each drug has `BrandName`s and one `LabelSnippet`. That nesting mirrors the
chain from Step 0.

**Why do this at all?** When your endpoint returns a `SymptomResponse`, FastAPI
automatically turns it into JSON *and* documents it on the `/docs` page. You
describe the shape once; you get validation and docs for free.

---

## Step 6 — The shared HTTP helper (`clients/base.py`)

All three APIs are "send a GET request, get JSON back." Rather than repeat the
timeout/retry/parse logic three times, write it once.

`app/clients/base.py`:

```python
from __future__ import annotations
import asyncio
from typing import Any
import httpx
from app.config import Settings, get_settings

class HTTPClient:
    def __init__(self, base_url, *, settings=None, client=None):
        self._settings = settings or get_settings()
        self._base_url = base_url.rstrip("/")
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            timeout=self._settings.http_timeout_seconds
        )

    async def get_json(self, path, params=None) -> dict[str, Any]:
        url = f"{self._base_url}/{path.lstrip('/')}"
        last_exc = None
        for attempt in range(self._settings.http_max_retries + 1):
            try:
                resp = await self._client.get(url, params=params)
                resp.raise_for_status()
                return resp.json()
            except (httpx.HTTPError, ValueError) as exc:
                last_exc = exc
                if attempt < self._settings.http_max_retries:
                    await asyncio.sleep(0.25 * (attempt + 1))
        raise last_exc

    async def aclose(self):
        if self._owns_client:
            await self._client.aclose()
```

**New ideas here:**
- `async`/`await` — these let the program do other work while waiting on the
  network. You don't need to master it now; just copy the pattern. Rule of
  thumb: if a function talks to the network, it's `async def`, and you `await`
  it when you call it.
- **Retry loop** — if a request fails, wait a moment and try again (up to
  `http_max_retries` times). Public APIs occasionally hiccup.
- **`raise_for_status()`** — turns an HTTP error (like 404/500) into a Python
  exception so the retry loop notices it.

Every client below *inherits* from this, so they only write the part that's
unique to their API.

---

## Step 7 — The three API clients

Each client is small: build the right URL, call `get_json`, and dig the useful
bits out of the nested response. **This digging is the whole job** — compare
each one to the JSON you saw in Step 3.

### `app/clients/rxclass.py` — condition → drugs

```python
from __future__ import annotations
from app.clients.base import HTTPClient

class RxClassClient(HTTPClient):
    async def drugs_may_treat(self, condition: str) -> list[dict[str, str]]:
        data = await self.get_json(
            "rxclass/class/byName.json", params={"className": condition}
        )
        classes = data.get("rxclassMinConceptList", {}).get("rxclassMinConcept", [])
        if not classes:
            return []
        class_id = classes[0].get("classId")
        rela_source = classes[0].get("classType", "DISEASE")
        members = await self.get_json(
            "rxclass/classMembers.json",
            params={
                "classId": class_id,
                "relaSource": "MEDRT",
                "rela": "may_treat",
                "relaSourceType": rela_source,
            },
        )
        drug_members = members.get("drugMemberGroup", {}).get("drugMember", [])
        out = []
        for m in drug_members:
            c = m.get("minConcept", {})
            if c.get("rxcui") and c.get("name"):
                out.append({"rxcui": str(c["rxcui"]), "name": c["name"]})
        return out
```

Notice the `.get("key", {})` pattern everywhere: it means "give me this key, or
an empty dict if it's missing." Real-world API responses are full of missing
fields, and this stops the code from crashing on them.

### `app/clients/rxnorm.py` — drug → brand names

```python
from __future__ import annotations
from app.clients.base import HTTPClient

class RxNormClient(HTTPClient):
    async def brand_names(self, rxcui: str) -> list[dict[str, str]]:
        data = await self.get_json(f"rxcui/{rxcui}/related.json", params={"tty": "BN"})
        groups = data.get("relatedGroup", {}).get("conceptGroup", [])
        out = []
        for group in groups:
            if group.get("tty") != "BN":
                continue
            for concept in group.get("conceptProperties", []):
                if concept.get("name"):
                    out.append({
                        "name": concept["name"],
                        "rxcui": str(concept.get("rxcui") or ""),
                    })
        return out
```

### `app/clients/openfda.py` — drug → label

```python
from __future__ import annotations
from typing import Any
from app.clients.base import HTTPClient
from app.config import Settings, get_settings

def _first(value):
    # openFDA label fields are LISTS of strings; take the first, trimmed.
    if isinstance(value, list) and value:
        return str(value[0]).strip() or None
    if isinstance(value, str):
        return value.strip() or None
    return None

class OpenFDAClient(HTTPClient):
    def __init__(self, *args, settings: Settings | None = None, **kwargs):
        settings = settings or get_settings()
        super().__init__(settings.openfda_base_url, settings=settings, **kwargs)
        self._api_key = settings.openfda_api_key

    async def label_snippet(self, generic_name: str):
        params = {"search": f'openfda.generic_name:"{generic_name}"', "limit": 1}
        if self._api_key:
            params["api_key"] = self._api_key
        try:
            data = await self.get_json("drug/label.json", params=params)
        except Exception:
            return None     # label coverage is spotty; a miss is OK
        results = data.get("results", [])
        if not results:
            return None
        label = results[0]
        indications = _first(label.get("indications_and_usage"))
        warnings = _first(label.get("warnings"))
        product_type = _first(label.get("openfda", {}).get("product_type"))
        if indications is None and warnings is None and product_type is None:
            return None
        return {"indications": indications, "warnings": warnings,
                "product_type": product_type}
```

**Why `try/except` returns `None` here:** not every drug has an FDA label. A
missing label shouldn't break the whole lookup — we just leave that field
empty. That's a deliberate design choice: *degrade gracefully.*

Also create two empty files so Python treats the folders as packages:
`app/__init__.py`, `app/clients/__init__.py`, `app/services/__init__.py`
(a one-line docstring inside is fine; even empty works).

---

## Step 8 — Symptom → condition map (`services/symptom_map.py`)

A symptom like "headache" is not drug data. We bridge it to a condition *name*
RxClass understands. To start, that bridge is just a hand-written dictionary —
honest and easy to read. You can grow it later or replace it with a medical
vocabulary (MeSH/SNOMED).

`app/services/symptom_map.py`:

```python
from __future__ import annotations

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
    return symptom.strip().lower()

def conditions_for(symptom: str) -> list[str]:
    return SYMPTOM_TO_CONDITIONS.get(normalize(symptom), [])

def known_symptoms() -> list[str]:
    return sorted(SYMPTOM_TO_CONDITIONS)
```

`normalize` means "Headache", "HEADACHE", and " headache " all match. Small
touch, saves a lot of confusion.

---

## Step 9 — Tie it together (`services/lookup.py`)

This is the conductor. It's the *only* file that uses all three clients. Read
it as the chain from Step 0, in code.

`app/services/lookup.py`:

```python
from __future__ import annotations
import asyncio
import httpx
from app.clients.openfda import OpenFDAClient
from app.clients.rxclass import RxClassClient
from app.clients.rxnorm import RxNormClient
from app.config import Settings, get_settings
from app.models import BrandName, Condition, Drug, LabelSnippet, SymptomResponse
from app.services import symptom_map
from app.services.ranking import rank_and_filter    # built in Step 12

async def lookup_symptom(symptom: str, *, settings: Settings | None = None) -> SymptomResponse:
    settings = settings or get_settings()
    condition_names = symptom_map.conditions_for(symptom)
    response = SymptomResponse(
        symptom=symptom_map.normalize(symptom), conditions=[],
        disclaimer=settings.disclaimer,
    )
    if not condition_names:
        return response

    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as http:
        rxclass = RxClassClient(settings.rxnav_base_url, settings=settings, client=http)
        rxnorm = RxNormClient(settings.rxnav_base_url, settings=settings, client=http)
        openfda = OpenFDAClient(settings=settings, client=http)

        for cond_name in condition_names:
            drug_concepts = await rxclass.drugs_may_treat(cond_name)
            drug_concepts = drug_concepts[: settings.candidate_pool_size]

            drugs = []
            for concept in drug_concepts:
                rxcui, ingredient = concept["rxcui"], concept["name"]
                brands_raw, label_raw = await asyncio.gather(
                    rxnorm.brand_names(rxcui),
                    openfda.label_snippet(ingredient),
                )
                brands = [BrandName(name=b["name"], rxcui=b.get("rxcui") or None)
                          for b in brands_raw]
                label = (LabelSnippet(**label_raw) if label_raw else None)
                drugs.append(Drug(rxcui=rxcui, ingredient=ingredient,
                                  brands=brands, label=label))

            ranked = rank_and_filter(drugs)[: settings.max_labels_per_lookup]
            response.conditions.append(
                Condition(name=cond_name, source="manual-map", drugs=ranked)
            )
    return response
```

**Two things worth pausing on:**

- **One shared `httpx.AsyncClient`** (`async with ...`) is passed into all three
  clients. Opening one connection pool and reusing it is faster than each
  client opening its own. The `async with` guarantees it closes afterward.
- **`asyncio.gather(...)`** runs the brand lookup and the label lookup *at the
  same time* instead of one-then-the-other. For each drug that roughly halves
  the wait. This is the only real "performance" trick in the app, and it's one
  line.

- **Enrich a wider pool, then rank, then cut.** We fetch `candidate_pool_size`
  (15) drugs, score them, and only then keep the top `max_labels_per_lookup`
  (5). If we cut to 5 *before* ranking, a good drug sitting at position 8 would
  be thrown away before we ever looked at it.

---

## Step 10 — The web endpoints (`main.py`)

Finally, expose it over HTTP. FastAPI turns plain functions into URLs.

`app/main.py`:

```python
from __future__ import annotations
from fastapi import FastAPI, HTTPException
from app.config import get_settings
from app.models import SymptomResponse
from app.services import symptom_map
from app.services.lookup import lookup_symptom

app = FastAPI(title="Symptom-Drug Reference", version="0.1.0")

@app.get("/")
async def root():
    return {"service": "symptom-drug-ref", "version": "0.1.0",
            "disclaimer": get_settings().disclaimer}

@app.get("/symptoms")
async def list_symptoms():
    return {"symptoms": symptom_map.known_symptoms()}

@app.get("/symptom/{name}", response_model=SymptomResponse)
async def get_symptom(name: str) -> SymptomResponse:
    if not symptom_map.conditions_for(name):
        raise HTTPException(status_code=404,
            detail=f"Symptom '{name}' not supported. See GET /symptoms.")
    return await lookup_symptom(name)
```

**New ideas here:**
- `@app.get("/symptom/{name}")` — the `{name}` part becomes the function's
  `name` argument. Visit `/symptom/headache` and `name == "headache"`.
- `response_model=SymptomResponse` — tells FastAPI "the answer is this shape."
  That powers validation and the auto-generated docs.
- `HTTPException(404, ...)` — the correct way to say "not found" over HTTP.

---

## Step 11 — Run it

```bash
uvicorn app.main:app --reload
```

`app.main:app` means "in the file `app/main.py`, use the variable `app`."
`--reload` restarts the server when you save a file (handy while learning).

Open <http://127.0.0.1:8000/docs> and click **Try it out** on
`/symptom/{name}`. Type `headache`. You'll see live data come back.

---

## Step 12 — Ranking: drop the supplements

Run `/symptom/headache` without ranking and you'll notice junk near the top —
e.g. *octopamine*, a supplement, outranking *naproxen* (Aleve). RxClass's
`may_treat` relation is broad; it doesn't know "real medicine" from
"supplement." So we add a scorer.

The trick: **don't hardcode a blocklist of bad drugs.** Instead, score each
drug on signals we already fetched:

- Does openFDA call it a `HUMAN OTC DRUG` / `HUMAN PRESCRIPTION DRUG`? Big plus.
- Does it have real brand names in RxNorm? Plus.
- Does its label/name say "supplement" or "homeopathic"? Big minus.

`app/services/ranking.py`:

```python
from __future__ import annotations
from app.models import Drug

_DRUG_PRODUCT_TYPES = {"HUMAN OTC DRUG", "HUMAN PRESCRIPTION DRUG"}
_DEMOTE_MARKERS = ("homeopathic", "dietary supplement", "supplement")

def score_drug(drug: Drug) -> int:
    score = 0
    label = drug.label
    product_type = (label.product_type or "") if label else ""
    pt = product_type.upper()
    name = drug.ingredient.lower()

    if pt in _DRUG_PRODUCT_TYPES:
        score += 100
    elif label is not None:
        score += 20
    if drug.brands:
        score += 30 + min(len(drug.brands), 5)
    if label and label.indications:
        score += 10
    if any(m in f"{pt.lower()} {name}" for m in _DEMOTE_MARKERS):
        score -= 80
    return score

def rank_and_filter(drugs: list[Drug], *, drop_below: int = 1) -> list[Drug]:
    scored = [(score_drug(d), d) for d in drugs]
    kept = [(s, d) for (s, d) in scored if s >= drop_below]
    kept.sort(key=lambda pair: pair[0], reverse=True)
    return [d for (_s, d) in kept]
```

**Why a pure function?** `score_drug` only looks at the data handed to it — no
network, no surprises. That makes it trivial to test (Step 13) and easy to
reason about. When you want to tune the ranking, this is the *one* place you
touch.

The numbers (100, 30, −80) are just weights you can tune. Start simple; adjust
once you see real output.

---

## Step 13 — Tests

Tests here do **not** hit the internet. We feed the code fake API responses and
check it assembles the right answer. That means tests are instant and work
offline — on a plane, in CI, anywhere.

`pytest.ini` (project root):

```
[pytest]
asyncio_mode = auto
asyncio_default_fixture_loop_scope = function
testpaths = tests
```

The simplest tests are for pure functions — no faking needed:

`tests/test_symptom_map.py`:

```python
from app.services import symptom_map

def test_normalize():
    assert symptom_map.normalize("  Headache ") == "headache"

def test_unknown_symptom_returns_empty():
    assert symptom_map.conditions_for("teleportation sickness") == []
```

`tests/test_ranking.py` — check a real drug beats a supplement:

```python
from app.models import BrandName, Drug, LabelSnippet
from app.services.ranking import score_drug, rank_and_filter

def _drug(rxcui, ingredient, *, brands=(), indications=None, product_type=None):
    label = None
    if indications is not None or product_type is not None:
        label = LabelSnippet(indications=indications, product_type=product_type)
    return Drug(rxcui=rxcui, ingredient=ingredient,
                brands=[BrandName(name=b) for b in brands], label=label)

def test_real_drug_beats_supplement():
    naproxen = _drug("1", "naproxen sodium", brands=["Aleve"],
                     indications="headache", product_type="HUMAN OTC DRUG")
    octopamine = _drug("2", "octopamine", indications="dietary supplement")
    assert score_drug(naproxen) > score_drug(octopamine)
```

For the full pipeline (`tests/test_lookup.py`), you replace `httpx`'s GET with a
fake that returns canned JSON, then call `lookup_symptom` and check the result.
(See the finished `tests/test_lookup.py` in the repo for the full version — it's
the one genuinely tricky test, so study it last.)

Run everything:

```bash
pytest -q
```

Green means every piece connects correctly, without touching the network.

---

## Step 14 — Where to go next

You now understand the whole app. Natural next steps, each self-contained:

1. **Add symptoms.** Just extend the dict in `symptom_map.py`. Easiest win.
2. **Cache responses.** Right now every request re-calls the APIs. Add a simple
   in-memory cache so repeated lookups are instant and kinder to the APIs.
3. **A web page.** A tiny HTML form that calls `/symptom/{name}` and shows the
   result — turns the API into something a non-programmer can use.
4. **Match indication text to the condition.** Our ranking proves "is this a
   real drug," not "is it right for *this* symptom." Comparing the label's
   indication text to the condition would cut the last false positives (like
   acetylcholine showing up for headache).
5. **Store the mapping in a database** (SQLite first) instead of a Python dict,
   once the map gets big.

Pick one, and only one, at a time. That's the opposite of vibe coding: small,
understood steps.
