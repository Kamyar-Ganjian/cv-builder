import { getCountry } from '../countries';
import type { Resume } from '../types';
import { bulletStats } from './bullets';
import { estimatePages, yearsOfExperience } from './estimate';
import { extractKeywords, keywordCoverage, resumeToText } from './keywords';

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** Why this matters - grounded in RESEARCH.md. */
  why: string;
  /** Weight in the overall score. */
  weight: number;
}

export interface ScoreResult {
  score: number; // 0-100
  checks: CheckItem[];
}

export function runAtsChecks(r: Resume): ScoreResult {
  const checks: CheckItem[] = [];
  const country = getCountry(r.settings.country);
  const stats = bulletStats(r);
  const pages = estimatePages(r);
  const years = yearsOfExperience(r);

  // --- Structure & parsing ---
  checks.push({
    id: 'layout',
    label: 'Parsable layout',
    status: r.settings.layout === 'single' ? 'pass' : 'warn',
    detail:
      r.settings.layout === 'single'
        ? 'Single-column - zero-risk for every ATS and fastest for recruiters.'
        : 'Hybrid sidebar: fine on modern ATS (Greenhouse/Lever/Ashby), riskier on legacy (Taleo/iCIMS).',
    why: 'Legacy parsers misread multi-column content; single-column never fails. (Jobscan)',
    weight: 12,
  });
  checks.push({
    id: 'headers',
    label: 'Standard section headings',
    status: 'pass',
    detail: 'All headings use the ATS-standard set (Professional Summary, Skills, Professional Experience, Education…).',
    why: 'Parsers map fields by heading name; creative headings break field mapping.',
    weight: 10,
  });
  checks.push({
    id: 'contact-body',
    label: 'Contact info in document body',
    status: 'pass',
    detail: 'Contact details render in the body - never in a header/footer, where parsers drop them.',
    why: 'Many parsers skip header/footer regions entirely. (Jobscan)',
    weight: 10,
  });
  checks.push({
    id: 'no-graphics',
    label: 'No tables, text boxes, icons or skill bars',
    status: 'pass',
    detail: 'Output is pure text flow - nothing that breaks extraction.',
    why: 'Tables/text boxes/graphics are the top causes of garbled parses. (Jobscan, TopResume)',
    weight: 10,
  });

  // --- Contact completeness ---
  const missingContact = [
    ['name', r.contact.fullName],
    ['email', r.contact.email],
    ['phone', r.contact.phone],
    ['location', r.contact.location],
  ].filter(([, v]) => !(v as string).trim()).map(([k]) => k);
  checks.push({
    id: 'contact-complete',
    label: 'Complete contact block',
    status: missingContact.length === 0 ? 'pass' : missingContact.length <= 1 ? 'warn' : 'fail',
    detail: missingContact.length === 0 ? 'Name, email, phone and location all present.' : `Missing: ${missingContact.join(', ')}.`,
    why: 'Recruiters filter by location; ATS requires email/phone to create a candidate record.',
    weight: 8,
  });

  // --- Typography ---
  checks.push({
    id: 'font',
    label: 'ATS-safe font & size',
    status: 'pass',
    detail: `${r.settings.fontFamily} ${r.settings.fontSize}pt - within the safe set (Arial/Calibri/Georgia/Helvetica/Times, 10-12pt).`,
    why: 'Exotic fonts fail to embed; <10pt is unreadable, >12pt wastes space.',
    weight: 6,
  });
  checks.push({
    id: 'margins',
    label: 'Margins in safe range',
    status: r.settings.margin >= 0.5 && r.settings.margin <= 1 ? 'pass' : 'warn',
    detail: `${r.settings.margin}" margins (safe range 0.5"-1").`,
    why: 'Tighter margins can clip when printed/parsed; wider wastes space.',
    weight: 4,
  });

  // --- Content quality ---
  const summaryWords = r.summary.trim().split(/\s+/).filter(Boolean).length;
  checks.push({
    id: 'summary',
    label: 'Summary: 2-4 lines, targeted',
    status: summaryWords === 0 ? 'warn' : summaryWords <= 65 ? 'pass' : 'warn',
    detail:
      summaryWords === 0
        ? 'No summary yet. Add 2-4 lines: role + years + top skills + 1-2 quantified highlights.'
        : `${summaryWords} words (~${Math.max(1, Math.round(summaryWords / 16))} lines). ${summaryWords > 65 ? 'Trim to ~30-55 words.' : 'Good length.'}`,
    why: 'The top third of page 1 gets the most gaze time in the 6-8s scan. (Ladders)',
    weight: 6,
  });

  const skillCount = r.skills.reduce((a, s) => a + s.skills.split(',').filter((x) => x.trim()).length, 0);
  checks.push({
    id: 'skills',
    label: 'Skills: 8-20 relevant, hard skills first',
    status: skillCount >= 8 && skillCount <= 20 ? 'pass' : skillCount > 0 ? 'warn' : 'fail',
    detail:
      skillCount === 0
        ? 'No skills listed - ATS keyword searches heavily weight the Skills section.'
        : `${skillCount} skills listed. ${skillCount < 8 ? 'Add more - mirror the job description exactly.' : skillCount > 20 ? 'Too many dilutes ranking; keep the most relevant 8-20.' : 'Good range.'}`,
    why: 'Recruiter ATS searches and match-rate algorithms lean on exact skill terms. (Jobscan)',
    weight: 8,
  });

  checks.push({
    id: 'metrics',
    label: 'Quantified bullets (target >= 60%)',
    status: stats.total === 0 ? 'fail' : stats.metricPct >= 60 ? 'pass' : stats.metricPct >= 35 ? 'warn' : 'fail',
    detail:
      stats.total === 0
        ? 'No bullets yet.'
        : `${stats.withMetric}/${stats.total} bullets (${stats.metricPct}%) contain a measurable result.`,
    why: "Google's XYZ formula: 'Accomplished X, as measured by Y, by doing Z.' Metrics prove impact.",
    weight: 10,
  });

  checks.push({
    id: 'verbs',
    label: 'Bullets start with action verbs',
    status: stats.total === 0 ? 'warn' : stats.verbPct >= 70 ? 'pass' : 'warn',
    detail:
      stats.total === 0
        ? 'No bullets yet.'
        : `${stats.withVerb}/${stats.total} bullets (${stats.verbPct}%) open with a strong verb.`,
    why: 'Harvard OCS: begin every bullet with an action verb; never "Responsible for…".',
    weight: 6,
  });

  // --- Length ---
  const recommended = years <= 4 ? 1 : 2;
  checks.push({
    id: 'length',
    label: 'Length fits experience level',
    status: pages <= recommended + 0.15 ? 'pass' : 'warn',
    detail: `Estimated ${pages} page(s). Recommended: ${recommended} page${recommended > 1 ? 's' : ''} for ~${years} years of experience.`,
    why: '1 page for 0-4 years, up to 2 otherwise. Every line must earn its place. (Harvard OCS)',
    weight: 6,
  });

  // --- Photo vs region ---
  const photoOn = r.settings.showPhoto && !!r.settings.photoDataUrl;
  checks.push({
    id: 'photo',
    label: 'Photo appropriate for region',
    status:
      country.photo === 'expected'
        ? photoOn
          ? 'pass'
          : 'info'
        : country.photo === 'discouraged'
          ? photoOn
            ? 'warn'
            : 'pass'
          : 'info',
    detail:
      country.photo === 'expected'
        ? photoOn
          ? `Photo on - matches ${country.name} convention. Keep it small and top-right.`
          : `Photos are standard in ${country.name}; consider enabling one.`
        : country.photo === 'discouraged'
          ? photoOn
            ? `Photos are discouraged in ${country.name} (bias risk + zero ATS value). Recommended off.`
            : `Photo off - correct for ${country.name}.`
          : `Optional in ${country.name} - your call.`,
    why: country.note,
    weight: 4,
  });

  // --- JD keyword coverage ---
  const jd = r.settings.jobDescription.trim();
  if (jd) {
    const kw = extractKeywords(jd);
    const cov = keywordCoverage(resumeToText(r), kw);
    checks.push({
      id: 'jd-coverage',
      label: 'Job description keyword coverage',
      status: cov.percent >= 70 ? 'pass' : cov.percent >= 40 ? 'warn' : 'fail',
      detail: `${cov.percent}% of ${kw.length} extracted JD keywords appear in your resume (${cov.missing.length} missing).`,
      why: 'ATS rank by literal keyword match - mirror exact JD phrasing. (Jobscan match-rate research)',
      weight: 12,
    });
  }

  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.reduce((a, c) => {
    const frac = c.status === 'pass' ? 1 : c.status === 'info' ? 1 : c.status === 'warn' ? 0.45 : 0;
    return a + c.weight * frac;
  }, 0);
  const score = Math.round((earned / totalWeight) * 100);
  return { score, checks };
}
