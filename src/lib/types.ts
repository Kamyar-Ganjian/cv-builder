// Core data models for the resume builder.
// Everything is JSON-serializable so resumes can be persisted to localStorage
// and exported/imported as JSON.

export type SectionId =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'courses';

export type LayoutMode = 'single' | 'hybrid';

export type PageSize = 'A4' | 'Letter';

/**
 * Only ATS-safe fonts are allowed (see RESEARCH.md §4).
 * Preview uses the real system fonts; PDF maps to Helvetica/Times built-ins;
 * DOCX passes the font name through (universally available).
 */
export type FontFamilyOption =
  | 'Arial'
  | 'Calibri'
  | 'Georgia'
  | 'Helvetica'
  | 'Times New Roman';

export interface ContactInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  linkedinText: string;
  github: string;
  githubText: string;
  website: string;
  websiteText: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  /** Comma-separated skills, kept as one string for simple editing. */
  skills: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  details: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link: string;
  tech: string;
  bullets: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface CourseItem {
  id: string;
  name: string;
  provider: string;
  date: string;
}

export interface ResumeSettings {
  /** ISO-ish country code driving photo guidance + page size default. */
  country: string;
  /** User override; default is derived from the country. */
  showPhoto: boolean;
  /** Whether the user explicitly overrode the country recommendation. */
  photoOverridden: boolean;
  photoDataUrl: string | null;
  layout: LayoutMode;
  fontFamily: FontFamilyOption;
  /** Body size in pt, constrained to 10–12. */
  fontSize: number;
  /** Subtle accent used ONLY for name + section headings + rules. */
  accent: string;
  pageSize: PageSize;
  /** Margins in inches, constrained to 0.5–1. */
  margin: number;
  sectionOrder: SectionId[];
  hiddenSections: SectionId[];
  /** Pasted target job description for keyword alignment. */
  jobDescription: string;
}

export interface Resume {
  id: string;
  /** Internal name so users can manage multiple tailored versions. */
  name: string;
  updatedAt: number;
  settings: ResumeSettings;
  contact: ContactInfo;
  summary: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  courses: CourseItem[];
}

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: 'Professional Summary',
  skills: 'Skills',
  experience: 'Professional Experience',
  education: 'Education',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  courses: 'Courses',
};

/** Sections that contain short list items — eligible for the hybrid sidebar. */
export const SIDEBAR_SECTIONS: SectionId[] = [
  'skills',
  'certifications',
  'languages',
  'courses',
];

/** Sections that stay in the main column in hybrid mode. */
export const MAIN_SECTIONS: SectionId[] = [
  'summary',
  'experience',
  'education',
  'projects',
];
