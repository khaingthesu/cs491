# Symptom → Drug Reference

An **educational** tool: you type a symptom (like "headache"), and the app
shows common drugs associated with the related condition — with brand names
(e.g. Aleve) and plain FDA label text (what it's for, its warnings). All data
comes from free US government drug databases.

> ⚠️ **Not medical advice.** This is for learning and reference only. It does
> not diagnose anything or tell anyone what to take. Always consult a
> pharmacist or physician.

---

## New here? Read the build guide first

If you want to **build this yourself and understand every line**, open
[`BUILD_GUIDE.md`](BUILD_GUIDE.md). It walks you through the project one small
file at a time, explaining *what* each piece does and *why* — no magic, no
fancy tricks. This README is just the quick reference.

---

## What it does, in four steps

1. **Symptom → condition.** "headache" isn't a drug fact, so we first map it to
   a medical condition name. We use a small hand-written list to start.
2. **Condition → drugs.** We ask **RxClass** which drugs "may treat" that
   condition.
3. **Drug → brand names.** We ask **RxNorm** for the brand names of each drug
   (so "naproxen sodium" also shows "Aleve, Anaprox").
4. **Drug → label info.** We ask **openFDA** for the drug's official label text
   (indications and warnings).

Then we **rank** the results so real OTC/prescription drugs float to the top
and supplements/homeopathics drop off.

---

## Requirements

You need these installed on your computer **before** anything else:

| Requirement | Version | How to check | Where to get it |
|---|---|---|---|
| Python | 3.11 or newer | `python3 --version` | https://www.python.org/downloads/ |
| pip | (comes with Python) | `python3 -m pip --version` | included with Python |
| Internet | — | — | the three APIs are online services |

No database, no Docker, no API key needed to start. (openFDA works without a
key; a free key just raises the rate limit.)

### Python packages (installed later with pip)

These go in `requirements.txt` — you do **not** install them by hand one by
one; `pip install -r requirements.txt` does it for you.

| Package | What it's for |
|---|---|
| `fastapi` | the web framework (defines the URLs/endpoints) |
| `uvicorn` | the web server that actually runs FastAPI |
| `httpx` | makes the HTTP calls to the drug APIs |
| `pydantic` | defines + validates the data shapes we return |
| `pydantic-settings`, `python-dotenv` | read settings from a `.env` file |
| `pytest`, `pytest-asyncio`, `respx` | run the tests (with fake HTTP, no internet) |

---

## Quick start (if you just want to run it)

```bash
cd symptom-drug-ref
python3 -m venv .venv              # make an isolated environment
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt    # install the packages above
uvicorn app.main:app --reload      # start the server
```

Then open <http://127.0.0.1:8000/docs> in a browser — FastAPI gives you a
clickable page to try every endpoint.

Or from another terminal:

```bash
curl http://127.0.0.1:8000/symptom/headache
```

---

## The endpoints

| Method & URL | What it returns |
|---|---|
| `GET /` | service name, version, and the disclaimer |
| `GET /symptoms` | the list of symptoms the app currently knows |
| `GET /symptom/{name}` | ranked drugs + brands + label text for that symptom |

---

## Data sources (all public, free, US federal)

| Source | Base URL | Used for |
|---|---|---|
| RxNorm | `https://rxnav.nlm.nih.gov/REST` | brand ↔ generic names |
| RxClass | `https://rxnav.nlm.nih.gov/REST` | condition → drug (`may_treat`) |
| openFDA | `https://api.fda.gov` | label text, indications, warnings |

---

## Project layout

```
symptom-drug-ref/
├── requirements.txt      the package list
├── pytest.ini            test configuration
├── .env.example          sample settings file
├── README.md             this file
├── BUILD_GUIDE.md        the step-by-step learning guide
├── app/
│   ├── __init__.py
│   ├── config.py         settings (URLs, timeouts, the disclaimer)
│   ├── models.py         the data shapes we return (pydantic)
│   ├── main.py           the FastAPI app + the three endpoints
│   ├── clients/          one small file per data source
│   │   ├── base.py       shared HTTP helper (timeout + retry)
│   │   ├── rxclass.py    condition → drugs
│   │   ├── rxnorm.py     drug → brand names
│   │   └── openfda.py    drug → label text
│   └── services/         the "business logic"
│       ├── symptom_map.py  the symptom → condition list
│       ├── ranking.py      scores + filters the drug list
│       └── lookup.py       ties all the clients together
└── tests/                tests that run offline (HTTP is faked)
    ├── test_symptom_map.py
    ├── test_ranking.py
    └── test_lookup.py
```

**The one idea to hold onto:** each client file does *one* thing and knows
*one* API. `services/lookup.py` is the only file that uses all of them
together. That's why it's easy to understand and easy to change.

---

## Running the tests

```bash
pytest -q
```

The tests use fake HTTP responses (via `respx`/monkeypatch), so they run
instantly and need no internet.
