import type { Resume } from '../types';

/**
 * Lightweight, fully client-side keyword extraction for job descriptions.
 * Strategy: lexicon phrase matching (multi-word skills) + frequency analysis
 * of meaningful unigrams/bigrams. No network calls - works offline.
 */

const STOPWORDS = new Set(
  (
    'a an the and or but if then else when at by for with about into through during before after above below to from up down in out on off over under again further once here there all any both each few more most other some such no nor not only own same so than too very can will just should now of is are was were be been being have has had having do does did doing would could ought i you he she it we they them his her its our their this that these those am as what which who whom how why where team teams work working ability strong experience experienced years year plus knowledge including include includes required requirements preferred preference skills skill role position job candidate ideal join help us our your youll youll will responsible responsibilities qualifications qualification degree bachelors masters equivalent related field fields business day days environment fast paced dynamic passionate motivated self starter detail oriented excellent communication written verbal interpersonal collaborate collaboration cross functional stakeholders stakeholder etc via per within without across using use used uses make made ensure ensuring drive driving deliver delivering delivered build building built create creating created develop developing developed design designing designed support supporting supported maintain maintaining maintained'
  ).split(/\s+/)
);

/**
 * Common hard skills / tools / methodologies frequently found in JDs.
 * Phrase-first (longest match wins). Extend freely - matching is case-insensitive.
 */
export const SKILL_LEXICON: string[] = [
  // languages & core tech
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'sql', 'nosql', 'html', 'css', 'sass', 'bash',
  // frontend
  'react', 'react native', 'next.js', 'vue', 'vue.js', 'nuxt', 'angular', 'svelte', 'redux', 'graphql', 'rest api', 'rest apis', 'tailwind css', 'webpack', 'vite', 'storybook', 'accessibility', 'wcag', 'responsive design', 'micro frontends', 'design systems', 'design system',
  // backend / data
  'node.js', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'laravel', '.net', 'asp.net', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'grpc', 'microservices', 'event-driven', 'websockets', 'oauth', 'jwt',
  // cloud / devops
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'devops', 'linux', 'nginx', 'serverless', 'lambda', 'cloudformation', 'observability', 'datadog', 'grafana', 'prometheus', 'sentry',
  // data / ai
  'machine learning', 'deep learning', 'data analysis', 'data engineering', 'data science', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'spark', 'airflow', 'dbt', 'snowflake', 'bigquery', 'tableau', 'power bi', 'looker', 'excel', 'etl', 'nlp', 'llm', 'generative ai', 'prompt engineering',
  // practices
  'agile', 'scrum', 'kanban', 'tdd', 'unit testing', 'integration testing', 'e2e testing', 'playwright', 'cypress', 'jest', 'vitest', 'testing library', 'code review', 'pair programming', 'mentoring', 'technical leadership', 'system design', 'architecture', 'performance optimization', 'a/b testing', 'experimentation', 'seo', 'web performance', 'core web vitals', 'lighthouse',
  // product / business
  'product management', 'project management', 'stakeholder management', 'roadmap', 'user research', 'ux', 'ui', 'figma', 'jira', 'confluence', 'salesforce', 'hubspot', 'crm', 'erp', 'sap', 'digital marketing', 'content strategy', 'email marketing', 'paid media', 'google analytics', 'customer success', 'account management', 'negotiation', 'budgeting', 'forecasting', 'p&l', 'supply chain', 'operations', 'recruiting', 'onboarding', 'compliance', 'gdpr', 'hipaa', 'soc 2', 'security', 'penetration testing',
  // soft-but-searchable
  'communication', 'leadership', 'problem solving', 'mentorship', 'ownership', 'collaboration',
];

export interface KeywordResult {
  term: string;
  count: number;
  /** 'skill' = matched lexicon phrase; 'term' = frequent JD word/phrase. */
  kind: 'skill' | 'term';
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Sort lexicon longest-first so multi-word phrases win over their parts. */
const SORTED_LEXICON = [...SKILL_LEXICON].sort((a, b) => b.length - a.length);

export function extractKeywords(jd: string, maxResults = 40): KeywordResult[] {
  if (!jd.trim()) return [];
  const lower = jd.toLowerCase();
  const results: KeywordResult[] = [];
  const consumed = new Set<string>();

  // 1) Lexicon phrase hits (exact phrase, word-boundaried)
  for (const phrase of SORTED_LEXICON) {
    const re = new RegExp(`(^|[^a-z0-9+#.])${escapeRegExp(phrase)}([^a-z0-9+#.]|$)`, 'g');
    const matches = lower.match(re);
    if (matches && matches.length > 0) {
      results.push({ term: phrase, count: matches.length, kind: 'skill' });
      consumed.add(phrase);
      phrase.split(/\s+/).forEach((w) => consumed.add(w));
    }
  }

  // 2) Frequent meaningful unigrams
  const words = lower
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !consumed.has(w) && !/^\d+$/.test(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  const topUnigrams = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  for (const [term, count] of topUnigrams) {
    results.push({ term, count, kind: 'term' });
  }

  // Skills first (weighted), then terms; cap results.
  results.sort((a, b) =>
    a.kind === b.kind ? b.count - a.count : a.kind === 'skill' ? -1 : 1
  );
  return results.slice(0, maxResults);
}

/** Flatten all resume text into one lowercase string for coverage checks. */
export function resumeToText(r: Resume): string {
  const parts: string[] = [
    r.contact.fullName,
    r.contact.jobTitle,
    r.contact.email,
    r.contact.phone,
    r.contact.location,
    r.contact.linkedin,
    r.contact.website,
    r.summary,
  ];
  for (const s of r.skills) parts.push(s.name, s.skills);
  for (const e of r.experience) parts.push(e.title, e.company, e.location, ...e.bullets);
  for (const e of r.education) parts.push(e.school, e.degree, e.field, e.details);
  for (const p of r.projects) parts.push(p.name, p.tech, ...p.bullets);
  for (const c of r.certifications) parts.push(c.name, c.issuer);
  for (const l of r.languages) parts.push(l.name, l.level);
  for (const c of r.courses) parts.push(c.name, c.provider);
  return parts.filter(Boolean).join('\n').toLowerCase();
}

export interface CoverageResult {
  matched: KeywordResult[];
  missing: KeywordResult[];
  /** 0-100, weighted: skills count double vs generic terms. */
  percent: number;
}

export function keywordCoverage(resumeText: string, keywords: KeywordResult[]): CoverageResult {
  const matched: KeywordResult[] = [];
  const missing: KeywordResult[] = [];
  for (const k of keywords) {
    const re = new RegExp(`(^|[^a-z0-9+#.])${escapeRegExp(k.term.toLowerCase())}([^a-z0-9+#.]|$)`);
    if (re.test(resumeText)) matched.push(k);
    else missing.push(k);
  }
  const weight = (k: KeywordResult) => (k.kind === 'skill' ? 2 : 1);
  const total = keywords.reduce((acc, k) => acc + weight(k), 0);
  const got = matched.reduce((acc, k) => acc + weight(k), 0);
  const percent = total === 0 ? 0 : Math.round((got / total) * 100);
  return { matched, missing, percent };
}
