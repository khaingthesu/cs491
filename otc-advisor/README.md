# OTC Advisor

A small **React + Vite** app that takes symptoms plus an optional reference note
and recommends over-the-counter (OTC) medicines with general adult dosing.
Navigation uses `react-router-dom` with `<Link>`. Written in plain JavaScript.

> ⚠️ **Educational demo only — not medical advice.** Dosing depends on age,
> weight, allergies, pregnancy, and interactions. Always read the product label
> and consult a pharmacist or doctor.

## Stack

- React 19 + Vite
- react-router-dom (v7 — the current major; there is no stable v8 yet) with
  `BrowserRouter`, `Routes`, `Route`, and `Link`
- React-Bootstrap for UI

## Routes

| Path        | Page      | Purpose                                      |
| ----------- | --------- | -------------------------------------------- |
| `/`         | Home      | Landing page                                 |
| `/advisor`  | Advisor   | Pick symptoms + add a reference note         |
| `/results`  | Results   | Shows matched OTC drugs, doses, references   |
| `/about`    | About     | How it works + medical disclaimer            |

## Getting started

```bash
cd otc-advisor
npm install
npm run dev
```

Then open the printed local URL.

## How it works

1. On **Advisor**, select one or more symptoms and optionally type a reference note.
2. The selection is passed via router state to **Results**.
3. `src/data/otcData.js` maps each symptom to OTC options (drug, adult dose,
   notes, and a reference source).

To extend the dataset, add entries to `symptoms` and `recommendations` in
`src/data/otcData.js`.
