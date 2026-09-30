import type { Resume, SectionId } from '../types';

export function hasContent(r: Resume, id: SectionId): boolean {
  switch (id) {
    case 'summary': return !!r.summary.trim();
    case 'skills': return r.skills.some((x) => x.skills.trim());
    case 'experience': return r.experience.some((e) => e.title.trim() || e.company.trim());
    case 'education': return r.education.some((e) => e.school.trim() || e.degree.trim());
    case 'projects': return r.projects.some((p) => p.name.trim());
    case 'certifications': return r.certifications.some((c) => c.name.trim());
    case 'languages': return r.languages.some((l) => l.name.trim());
    case 'courses': return r.courses.some((c) => c.name.trim());
  }
}

export function visibleSections(r: Resume): SectionId[] {
  return r.settings.sectionOrder.filter((id) => !r.settings.hiddenSections.includes(id) && hasContent(r, id));
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** docx ImageRun requires an explicit raster type; derive it from the data URL mime. */
export function dataUrlImageType(dataUrl: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  const mime = (dataUrl.match(/^data:(image\/[a-z]+);/i)?.[1] ?? '').toLowerCase();
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('bmp')) return 'bmp';
  return 'png';
}

export function slugify(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'resume';
}
