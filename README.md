# ATS Resume Builder

A free, fully client-side resume builder engineered for **both** machine parsing (ATS) **and** the
human 6–8 second recruiter scan. No accounts, no servers — your data never leaves your browser.

Every rule the app enforces is grounded in published research: see **[RESEARCH.md](./RESEARCH.md)**
(Jobscan ATS studies, Ladders eye-tracking, Harvard/Yale career services, Google's XYZ formula,
country-by-country photo conventions, vendor behavior of Workday/Taleo/iCIMS/Greenhouse/Lever/Ashby).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## What makes this different from template generators

| Problem with typical builders | This app |
|---|---|
| Pretty two-column Canva layouts that garble in Taleo/iCIMS | Strict single-column default; "safe hybrid" offered only with an explicit risk note |
| Contact info in headers/footers (parsers drop it) | Contact always in the document body |
| Icons, skill bars, tables, text boxes | None, ever — pure linear text flow |
| "Never use a photo" dogma | Country selector → region-correct recommendation (US/UK off, DACH/Japan/LatAm on) + tradeoff warning; user always decides |
| Generic bullets | Live bullet analyzer: action verb, metric, length, first-person, weak-opener checks with rewrite hints (Google XYZ / Harvard OCS) |
| No keyword guidance | Paste the job description → keyword extraction (lexicon + frequency) → coverage % and missing terms |
| Image-only PDF exports | Text-selectable PDF (@react-pdf/renderer, built-in Helvetica/Times) **and** .docx (safest for legacy ATS) |
| No way to verify parsing | "ATS paste test" panel shows exactly what an extractor sees, in order, ready to copy into any checker |

## Feature map

- **Live preview** — true A4/Letter rendering, safe fonts only (Arial/Calibri/Georgia/Helvetica/TNR),
  10–12pt body, 0.5–1" margins, subtle accent colors that never touch body text.
- **Region-aware photo** — 48 countries with discouraged/optional/expected conventions, small
  top-right headshot that never breaks text flow.
- **Section manager** — reorder + show/hide within the ATS-standard heading set.
- **Job Match** — JD keyword extraction, weighted coverage score, one-click missing-keyword copy.
- **ATS Check** — weighted health score across parsing safety, contact completeness, summary length,
  skill count, quantification (≥60% target), action verbs, length vs. experience, photo/region fit,
  JD keyword coverage.
- **Multi-resume** — duplicate-and-tailor workflow, all stored in localStorage, JSON export/import.
- **Exports** — text-selectable PDF, .docx, plain-text copy.

## Architecture

```
src/
  app/                 Next.js App Router shell (page.tsx = builder UI)
  lib/
    types.ts           Resume data model (JSON-serializable)
    countries.ts       48-country photo conventions + page-size defaults
    defaults.ts        factories, safe font list, accent palette
    sample.ts          realistic sample resume
    store.ts           zustand store, localStorage persistence, import/export
    analysis/
      keywords.ts      JD keyword extraction (skill lexicon + frequency)
      bullets.ts       XYZ-formula bullet analyzer
      atsScore.ts      weighted ATS health checklist
      plainText.ts     ATS parse-order simulation (the "paste test")
      estimate.ts      page-count & years-of-experience heuristics
    export/
      PdfDocument.tsx  text-selectable PDF (@react-pdf/renderer)
      buildDocx.ts     .docx generator (docx package, no tables, floating photo)
      shared.ts        section visibility helpers, data-URL utils
  components/
    ui.tsx             shared form primitives
    ResumeManager.tsx  multi-resume switcher / JSON import-export
    forms/             section forms + Design panel + JD panel + Score panel
    preview/           live A4/Letter preview
    export/            PDF/DOCX buttons (lazy-loaded libraries)
```

## Design constraints (intentional, do not loosen)

- Layout: single-column default; hybrid only with warning.
- Fonts: the five ATS-safe families only; body 10–12pt; margins 0.5–1".
- Accent color applies to name/headings/rules only — body text is always near-black.
- Section headings are fixed to the standard set (parsers map fields by name).
- No tables, text boxes, icons, skill bars, or graphics in output.
