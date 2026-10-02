import { DEFAULT_COUNTRY, getCountry } from './countries';
import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  Resume,
  ResumeSettings,
  SectionId,
  SkillCategory,
} from './types';

export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/** Subtle, dark-enough accent colors. Only ever used for name/headings/rules - never body text. */
export const ACCENT_COLORS: { name: string; value: string }[] = [
  { name: 'Slate', value: '#334155' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Forest', value: '#2d5a3d' },
  { name: 'Burgundy', value: '#6b2d3b' },
  { name: 'Teal', value: '#0f5e68' },
  { name: 'Charcoal', value: '#1f2937' },
];

export const FONT_OPTIONS = [
  'Arial',
  'Calibri',
  'Georgia',
  'Helvetica',
  'Times New Roman',
] as const;

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
  'languages',
  'courses',
];

export function defaultSettings(countryCode: string = DEFAULT_COUNTRY): ResumeSettings {
  const country = getCountry(countryCode);
  return {
    country: country.code,
    showPhoto: country.photo === 'expected',
    photoOverridden: false,
    photoDataUrl: null,
    layout: 'single',
    fontFamily: 'Calibri',
    fontSize: 11,
    accent: '#1e3a5f',
    pageSize: country.pageSize,
    margin: 0.7,
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    hiddenSections: ['projects', 'certifications', 'languages', 'courses'],
    jobDescription: '',
  };
}

const emptyContact = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  linkedinText: '',
  github: '',
  githubText: '',
  website: '',
  websiteText: '',
};

export function createEmptyResume(name: string, countryCode?: string): Resume {
  return {
    id: uid(),
    name,
    updatedAt: Date.now(),
    settings: defaultSettings(countryCode),
    contact: { ...emptyContact },
    summary: '',
    skills: [{ id: uid(), name: 'Core Competencies', skills: '' }],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    courses: [],
  };
}

export function newExperience(): ExperienceItem {
  return { id: uid(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] };
}
export function newEducation(): EducationItem {
  return { id: uid(), school: '', degree: '', field: '', location: '', startDate: '', endDate: '', current: false, details: '' };
}
export function newProject(): ProjectItem {
  return { id: uid(), name: '', link: '', tech: '', bullets: [''] };
}
export function newSkillCategory(): SkillCategory {
  return { id: uid(), name: '', skills: '' };
}
