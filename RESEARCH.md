# Research Summary — What Actually Works in 2025–2026 (ATS + Recruiters)

This file documents the standards this app enforces, with the sources they come from.
The goal is **maximum interview rate**, not decoration. Where sources conflict, we take the
lower-risk option.

---

## 1. How ATS software really parses & ranks

**Sources:** Jobscan ATS research (2024–2025), TopResume ATS tests, Enhancv ATS-parse tests,
vendor docs/behavior of Workday, Taleo, iCIMS, Greenhouse, Lever, Ashby, SmartRecruiters,
and common parsing engines (Textkernel/Sovren, Affinda) used under the hood.

- ~98–99% of Fortune 500 companies and the majority of mid-size companies use an ATS.
  Most systems **rank** resumes against the job description rather than auto-rejecting —
  but low rank = never seen by a human.
- **Legacy/fragile parsers** (Taleo, iCIMS, older Workday configurations) reliably break on:
  - tables used for layout
  - multi-column layouts
  - text boxes / shapes
  - headers & footers (contact info placed there is frequently **dropped entirely**)
  - icons, logos, images (ignored at best, content-killers at worst)
  - skill bars / star ratings (parse as nothing, and mean nothing to recruiters)
- **Modern parsers** (Greenhouse, Lever, Ashby, SmartRecruiters; Textkernel/Affinda engines)
  tolerate clean text-PDFs and simple two-column designs far better — but recruiters
  still scan single-column faster, and no parser benefits from decoration.
- **Standard section headings are required for correct field mapping**:
  "Professional Summary", "Skills", "Professional Experience" / "Work Experience",
  "Education", "Certifications". Creative headings ("My Journey") fail mapping.
- **Keyword matching is literal-ish**: exact phrase + close variants. Hard skills in the
  Skills section are heavily weighted in recruiter searches inside ATS databases
  (Jobscan "match rate" research). Mirror the job description's exact phrasing, naturally.
- **File format**: `.docx` is the zero-risk format for legacy systems; text-based PDF is fine
  for modern systems. Image-only PDFs (Canva exports, scans) parse as blank.
  **This app therefore exports both: text-selectable PDF + .docx.**

**Consequences baked into the app:**
- Single-column is the default and recommended layout.
- "Hybrid" (main column + slim skills sidebar) is offered only with an explicit risk note.
- Contact information always lives in the document body — never in a header/footer.
- No tables, no text boxes, no icons, no skill bars, no graphics anywhere in output.
- Section headings are fixed to the standard set.

## 2. How recruiters actually read (eye-tracking)

**Sources:** Ladders eye-tracking study (2018, ~7.4s initial scan) and 2024–2025 follow-ups
(6–8 seconds), Nielsen Norman Group F-pattern research, recruiter surveys (TopResume, LinkedIn).

- Initial scan: **6–8 seconds**. Recruiters look at: name → current/most recent title &
  company → dates → section headings → then decide read/reject.
- F-pattern: the **top third of page 1** carries disproportionate weight. Job title, summary
  and skills must live there.
- Clear visual hierarchy (bold titles, consistent dates, whitespace) increases time spent on
  content; dense paragraphs and decoration decrease it.
- Reverse-chronological is the format recruiters expect; functional/hybrid-skill formats are
  distrusted ("what are they hiding?").
- Length: **1 page for 0–4 years of experience, up to 2 pages beyond that.** Every line must
  earn its place. (Harvard OCS, Indeed, LinkedIn guidance.)
- Recruiters dislike: "Responsible for…", soft-skill claims without evidence, objective
  statements, skill bars, photos (in anti-bias markets), and >2 pages for non-executives.

## 3. Photo conventions by country (dual optimization)

**Sources:** Country career guides (Resume.io, Zety, Novoresume country guides), EEOC / UK
Equality Act norms, Japanese *rirekisho* standard, DACH recruiting norms, 2023–2025
blind-hiring trends.

- **Photo strongly discouraged (bias risk + ATS friction):** United States, United Kingdom,
  Canada, Australia, Ireland, New Zealand. US/UK recruiters often discard photo resumes to
  avoid discrimination exposure.
- **Photo trending off / optional:** Netherlands, Sweden, Norway, Denmark, Finland, India.
- **Photo common or expected:** Germany, Austria, Switzerland, France, Spain, Italy, Portugal,
  Belgium, Poland & most of Eastern Europe, Greece, Turkey, Japan (rirekisho *mandates* it),
  South Korea (common, blind-hiring growing), China, Brazil, Mexico & most of Latin America,
  UAE, Saudi Arabia, Qatar & most of the Middle East, Egypt, Philippines, Indonesia, Thailand,
  Vietnam, Argentina, Chile, Colombia, Russia, Ukraine, Czechia, Hungary, Croatia, Romania,
  Bulgaria, Serbia.

**Consequences baked into the app:**
- A **country selector** drives the default photo ON/OFF recommendation and explains *why*.
- The user always has the final say; when photo is ON the app shows the ATS/bias tradeoff.
- Photo placement: small professional headshot, top-right of the contact block, never
  breaking text flow or linear text extraction.

## 4. Content standards (university career services + big-tech recruiters)

**Sources:** Harvard Office of Career Services "Resumes & Cover Letters", Yale OCS,
Stanford BEAM, Laszlo Bock (former SVP People Operations, Google) — the **XYZ formula**,
Google recruiting resume guidance, Jobscan keyword research.

- **Professional Summary: 2–4 lines.** Role-targeted: title + years of experience +
  3–5 top skills + 1–2 quantified highlights. No objective statements, no fluff.
- **Bullets use XYZ / CAR:** *"Accomplished [X], as measured by [Y], by doing [Z]."*
  Strong action verb first (Harvard's verb list: led, built, reduced, grew, launched…),
  then context/tech, then measurable result.
- **Quantify relentlessly:** users, %, $, latency, time saved, scale, team size.
  Target: **≥60% of bullets contain a number.**
- **Max ~2 lines per bullet** (~15–25 words). No first-person pronouns. No "responsible for".
- **Skills: 8–20 relevant hard skills**, optionally categorized (Languages, Frontend,
  Data, Tools…), exact JD phrasing, placed high on the page.
- **Fonts:** Arial, Calibri, Georgia, Helvetica, Times New Roman. Body 10–12pt.
- **Margins:** 0.5–1 inch.
- **No keyword stuffing, no white text, no hidden blocks** — modern parsers flag it.

## 5. 2025–2026 notes

- AI screening amplifies — not replaces — the same rules: clean parse + exact keyword
  alignment + quantified evidence.
- Skills-based hiring pushes the Skills section higher in importance.
- ATS "auto-rejection" is largely a myth; **ranking** is the real filter — which makes
  JD mirroring the single highest-leverage content activity (hence this app's JD panel).

---

### Enforcement map (research → feature)

| Finding | Feature |
|---|---|
| Single-column safest; headers/footers dropped | Layout engine emits only linear-flow content; contact always in body |
| Standard headings required | Fixed standard section labels |
| docx safest on legacy, text-PDF on modern | Dual export: text-selectable PDF + .docx |
| Photo is region-dependent | Country selector → recommendation + user override + tradeoff warning |
| 6–8s scan, F-pattern | Preview enforces strong top-third: name/title/summary/skills first |
| XYZ bullets, ≥60% metrics | Bullet analyzer: action verb, metric, length checks + rewrite hints |
| Mirror JD keywords | JD paste → keyword extraction → coverage % + missing terms |
| 10–12pt, 0.5–1in, safe fonts | Settings constrained to the safe ranges only |
| Verify parsing | Plain-text parse-order preview ("paste test") |
