import type { PageSize } from './types';

export type PhotoConvention = 'discouraged' | 'optional' | 'expected';

export interface Country {
  code: string;
  name: string;
  photo: PhotoConvention;
  pageSize: PageSize;
  note: string;
}

/**
 * Photo conventions by country — see RESEARCH.md §3 for sources.
 * 'discouraged': bias risk + ATS friction; recruiters may discard photo resumes.
 * 'optional':    common but declining; safe either way.
 * 'expected':    standard practice; omitting a photo can look unusual.
 */
export const COUNTRIES: Country[] = [
  // --- Photo strongly discouraged ---
  { code: 'US', name: 'United States', photo: 'discouraged', pageSize: 'Letter', note: 'Recruiters often discard photo resumes to avoid discrimination exposure (EEOC norms). Keep it off.' },
  { code: 'GB', name: 'United Kingdom', photo: 'discouraged', pageSize: 'A4', note: 'Equality Act norms — UK recruiters actively prefer no photo. Keep it off.' },
  { code: 'CA', name: 'Canada', photo: 'discouraged', pageSize: 'Letter', note: 'Same anti-bias convention as the US. Keep it off.' },
  { code: 'AU', name: 'Australia', photo: 'discouraged', pageSize: 'A4', note: 'Photos are discouraged and can trigger bias concerns. Keep it off.' },
  { code: 'IE', name: 'Ireland', photo: 'discouraged', pageSize: 'A4', note: 'Follows UK convention — photos discouraged. Keep it off.' },
  { code: 'NZ', name: 'New Zealand', photo: 'discouraged', pageSize: 'A4', note: 'Photos are not expected and best avoided. Keep it off.' },
  // --- Optional / trending off ---
  { code: 'NL', name: 'Netherlands', photo: 'optional', pageSize: 'A4', note: 'Photos used to be common; now clearly optional and trending off.' },
  { code: 'SE', name: 'Sweden', photo: 'optional', pageSize: 'A4', note: 'Optional. Many recruiters prefer anonymous applications.' },
  { code: 'NO', name: 'Norway', photo: 'optional', pageSize: 'A4', note: 'Optional and trending toward no photo.' },
  { code: 'DK', name: 'Denmark', photo: 'optional', pageSize: 'A4', note: 'Optional; both are accepted.' },
  { code: 'FI', name: 'Finland', photo: 'optional', pageSize: 'A4', note: 'Optional and trending off.' },
  { code: 'IN', name: 'India', photo: 'optional', pageSize: 'A4', note: 'Optional — common in some industries, unnecessary for tech. Off is the safer default.' },
  { code: 'SG', name: 'Singapore', photo: 'optional', pageSize: 'A4', note: 'Optional; multinational employers increasingly prefer none.' },
  { code: 'ZA', name: 'South Africa', photo: 'optional', pageSize: 'A4', note: 'Optional; larger employers trend toward no photo.' },
  // --- Photo common or expected ---
  { code: 'DE', name: 'Germany', photo: 'expected', pageSize: 'A4', note: 'Professional photo (Bewerbungsfoto) remains standard practice, though slowly declining.' },
  { code: 'AT', name: 'Austria', photo: 'expected', pageSize: 'A4', note: 'Follows German convention — photo expected.' },
  { code: 'CH', name: 'Switzerland', photo: 'expected', pageSize: 'A4', note: 'Photo is standard in Swiss applications.' },
  { code: 'FR', name: 'France', photo: 'expected', pageSize: 'A4', note: 'Photos are common and generally expected, though technically optional.' },
  { code: 'ES', name: 'Spain', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice and often expected.' },
  { code: 'IT', name: 'Italy', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'PT', name: 'Portugal', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'BE', name: 'Belgium', photo: 'expected', pageSize: 'A4', note: 'Photo is common, especially outside tech multinationals.' },
  { code: 'PL', name: 'Poland', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'CZ', name: 'Czechia', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'HU', name: 'Hungary', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'RO', name: 'Romania', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'BG', name: 'Bulgaria', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'HR', name: 'Croatia', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'RS', name: 'Serbia', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'GR', name: 'Greece', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'TR', name: 'Turkey', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'RU', name: 'Russia', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'UA', name: 'Ukraine', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'JP', name: 'Japan', photo: 'expected', pageSize: 'A4', note: 'The standard rirekisho format mandates a professional ID-style photo.' },
  { code: 'KR', name: 'South Korea', photo: 'expected', pageSize: 'A4', note: 'Photos remain common, though blind hiring is growing at large firms.' },
  { code: 'CN', name: 'China', photo: 'expected', pageSize: 'A4', note: 'Photo is standard practice.' },
  { code: 'AE', name: 'United Arab Emirates', photo: 'expected', pageSize: 'A4', note: 'Photo is common and often expected.' },
  { code: 'SA', name: 'Saudi Arabia', photo: 'expected', pageSize: 'A4', note: 'Photo is common and often expected.' },
  { code: 'QA', name: 'Qatar', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'EG', name: 'Egypt', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'BR', name: 'Brazil', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'MX', name: 'Mexico', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'AR', name: 'Argentina', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'CL', name: 'Chile', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'CO', name: 'Colombia', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'PH', name: 'Philippines', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'ID', name: 'Indonesia', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'TH', name: 'Thailand', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
  { code: 'VN', name: 'Vietnam', photo: 'expected', pageSize: 'A4', note: 'Photo is common practice.' },
];

export const DEFAULT_COUNTRY = 'US';

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export const PHOTO_GUIDANCE: Record<PhotoConvention, string> = {
  discouraged:
    'In this market, photos create unconscious-bias and legal exposure — many recruiters discard photo resumes. Photos also add no parsing value for ATS. Recommended: OFF.',
  optional:
    'Photos are accepted but no longer expected here. Off is the slightly safer default; on is acceptable for local, traditional employers.',
  expected:
    'A professional headshot is standard practice in this market and omitting one can look unusual. Recommended: ON — keep it small, top-right, and neutral.',
};
