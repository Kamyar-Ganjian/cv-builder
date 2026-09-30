/**
 * Bullet quality analyzer based on Harvard OCS guidance + Google's XYZ formula
 * ("Accomplished X, as measured by Y, by doing Z" - Laszlo Bock).
 */

export const ACTION_VERBS = new Set(
  (
    'accelerated achieved acquired adapted administered advanced analyzed architected arranged assembled assessed attained audited authored automated boosted built calculated campaigned chaired coached co-authored collaborated conceived conducted consolidated constructed consulted converted coordinated created cut debugged decreased delivered demonstrated designed developed devised diagnosed directed doubled drafted drove earned edited eliminated enabled engineered enhanced established evaluated exceeded executed expanded facilitated forecasted founded generated grew guided halved identified implemented improved increased initiated innovated inspected installed instituted instructed integrated interviewed introduced invented investigated launched led lifted maintained managed marketed maximized measured mentored migrated minimized modernized monitored negotiated optimized orchestrated organized overhauled oversaw partnered performed pioneered planned presented prioritized produced programmed promoted proposed prototyped published quantified raised rebuilt redesigned reduced reengineered refactored refined engineered remodelled reorganized researched resolved restructured revamped reviewed revitalized saved scaled secured shipped simplified slashed solved spearheaded standardized steered streamlined strengthened structured supervised supported surpassed surveyed taught tested trained transformed translated tripled tutored upgraded validated visualized won wrote'
  ).split(/\s+/)
);

const WEAK_OPENERS = [
  /^responsible for\b/i,
  /^duties included\b/i,
  /^tasked with\b/i,
  /^helped (with|to)\b/i,
  /^worked on\b/i,
  /^assisted (with|in)\b/i,
  /^participated in\b/i,
  /^was involved in\b/i,
  /^in charge of\b/i,
];

const FIRST_PERSON = /\b(i|me|my|mine|we|our|us)\b/i;
const METRIC = /(\d+(\.\d+)?\s?%|[$€£]\s?\d|\d+x\b|\b\d{2,}\b|\b\d+(\.\d+)?\s?(k|m|bn|million|billion|thousand)\b|\b\d+\s?(users|customers|engineers|people|teams|clients|projects|requests|transactions|records|tickets|hours|days|weeks|months|sprints)\b|\b(first|second|third)\b|\btop\s?\d+\b|\b\d+(\.\d+)?\s?(s|ms|min|hrs?)\b|\b\d+\+|\$\d)/i;

export interface BulletAnalysis {
  text: string;
  startsWithActionVerb: boolean;
  hasWeakOpener: boolean;
  hasMetric: boolean;
  hasFirstPerson: boolean;
  wordCount: number;
  /** Rough line estimate at typical resume widths (~2 lines max recommended). */
  tooLong: boolean;
  issues: string[];
  hints: string[];
  score: number; // 0-100
}

export function analyzeBullet(raw: string): BulletAnalysis {
  const text = raw.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const firstWord = (words[0] ?? '').toLowerCase().replace(/[^a-z]/g, '');
  const startsWithActionVerb = ACTION_VERBS.has(firstWord);
  const hasWeakOpener = WEAK_OPENERS.some((re) => re.test(text));
  const hasMetric = METRIC.test(text);
  const hasFirstPerson = FIRST_PERSON.test(text);
  const wordCount = words.length;
  const tooLong = wordCount > 30;

  const issues: string[] = [];
  const hints: string[] = [];

  if (text.length === 0) {
    return { text, startsWithActionVerb: false, hasWeakOpener: false, hasMetric: false, hasFirstPerson: false, wordCount: 0, tooLong: false, issues: ['Empty bullet'], hints: [], score: 0 };
  }
  if (hasWeakOpener) {
    issues.push('Weak opener ("responsible for", "helped with"…) hides your impact');
    hints.push('Start with a strong action verb: Led, Built, Cut, Grew, Shipped…');
  } else if (!startsWithActionVerb) {
    issues.push('Does not start with a strong action verb');
    hints.push('Lead with the outcome verb: "Reduced…", "Launched…", "Automated…"');
  }
  if (!hasMetric) {
    issues.push('No measurable result (%, $, time, scale, count)');
    hints.push('Add the Y of Google\'s XYZ formula: "as measured by {metric}" - e.g. "cut latency 40%", "$2M saved", "10K users"');
  }
  if (hasFirstPerson) {
    issues.push('First-person pronoun (I/my/we) - drop it, the subject is implied');
  }
  if (tooLong) {
    issues.push(`Too long (${wordCount} words) - recruiters skim; aim for 2 lines max (~15-25 words)`);
    hints.push('Split into two bullets or cut filler words');
  }

  let score = 100;
  if (hasWeakOpener) score -= 35;
  else if (!startsWithActionVerb) score -= 25;
  if (!hasMetric) score -= 30;
  if (hasFirstPerson) score -= 10;
  if (tooLong) score -= 15;
  score = Math.max(0, score);

  return { text, startsWithActionVerb, hasWeakOpener, hasMetric, hasFirstPerson, wordCount, tooLong, issues, hints, score };
}

export function allBullets(r: {
  experience: { bullets: string[] }[];
  projects: { bullets: string[] }[];
}): string[] {
  return [...r.experience.flatMap((e) => e.bullets), ...r.projects.flatMap((p) => p.bullets)].filter((b) => b.trim().length > 0);
}

export function bulletStats(r: {
  experience: { bullets: string[] }[];
  projects: { bullets: string[] }[];
}): { total: number; withMetric: number; metricPct: number; withVerb: number; verbPct: number; avgScore: number } {
  const bs = allBullets(r).map(analyzeBullet);
  const total = bs.length;
  if (total === 0) return { total: 0, withMetric: 0, metricPct: 0, withVerb: 0, verbPct: 0, avgScore: 0 };
  const withMetric = bs.filter((b) => b.hasMetric).length;
  const withVerb = bs.filter((b) => b.startsWithActionVerb).length;
  const avgScore = Math.round(bs.reduce((a, b) => a + b.score, 0) / total);
  return {
    total,
    withMetric,
    metricPct: Math.round((withMetric / total) * 100),
    withVerb,
    verbPct: Math.round((withVerb / total) * 100),
    avgScore,
  };
}
