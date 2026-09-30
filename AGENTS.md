# AGENTS.md

## Project
ATS Resume Builder — Next.js (App Router) + TypeScript + Tailwind v4 + zustand.
Fully client-side; all resume data lives in localStorage (`cv-builder-v1`). No backend.

## Commands
- `npm run dev` — dev server
- `npm run build` — typecheck + production build (must stay green)
- `npm run lint` — eslint (must stay green)

## Ground rules for contributors
- **Read `RESEARCH.md` first.** Every formatting constraint is sourced there. Do not loosen
  ATS-safety constraints (single-column default, standard headings, safe fonts, 10–12pt,
  0.5–1" margins, no tables/text boxes/icons/skill bars, contact in body) without updating
  RESEARCH.md with a source.
- ASCII-only in source files (write tool encoding). Use `&quot;` etc. in JSX text; avoid
  em-dashes/smart quotes in code.
- Keep everything client-side and offline-capable. No network calls in analysis/export code.
- When changing the resume schema (`src/lib/types.ts`), bump the persist version in
  `src/lib/store.ts` and keep `importJson` migration tolerant (it already merges over defaults).

## Key files
- `src/lib/types.ts` — data model
- `src/lib/countries.ts` — photo conventions per country (photo on/off recommendation)
- `src/lib/store.ts` — zustand + persist, multi-resume, import/export
- `src/lib/analysis/*` — keyword extraction, bullet analyzer, ATS score, plain-text parse sim
- `src/lib/export/PdfDocument.tsx` — text-selectable PDF (react-pdf, built-in fonts only)
- `src/lib/export/buildDocx.ts` — .docx (docx pkg; no tables; floating photo; hybrid degrades to single column)
- `src/components/preview/ResumePreview.tsx` — live A4/Letter preview (scale-to-fit)

## Gotchas learned
- `docx` v9: use `TextWrappingType` (not `TextWrapType`); `ImageRun` requires explicit
  raster `type` — derive from data URL via `dataUrlImageType()` in `export/shared.ts`.
- `@react-pdf/renderer`: `pdf()` types require a cast when wrapping `<Document>` in a custom
  component; only built-in fonts (Helvetica/Times-Roman) are used — do not register webfonts
  (offline requirement). PNG images decode via Web Worker (browser-only — fine, export is client-side).
- Hydration: the page gates on `useSyncExternalStore` mounted flag because the store hydrates
  from localStorage — do not remove.
- DOCX cannot do a safe two-column layout without tables, so hybrid resumes export as
  single-column .docx (main sections, then sidebar sections). PDF keeps the hybrid look.

## Verification pattern (no test framework)
Smoke-test core logic in Node via `npx tsx` with a script importing from `src/lib/*`
(analysis + docx work in Node). For PDF, bundle a script with `npx esbuild --platform=browser`
and run in Node — verifies document validity end-to-end.
