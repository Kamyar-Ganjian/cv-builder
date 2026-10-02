import type { Resume, SectionId, SkillCategory } from '../types';

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

export function skillCategoryRows(r: Resume): SkillCategory[][] {
  const categories = r.skills.filter((category) => category.skills.trim());
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const pairedWith = new Map<string, string>();

  for (const [firstId, secondId] of r.skillPairs ?? []) {
    if (
      firstId === secondId ||
      !categoriesById.has(firstId) ||
      !categoriesById.has(secondId) ||
      pairedWith.has(firstId) ||
      pairedWith.has(secondId)
    ) {
      continue;
    }
    pairedWith.set(firstId, secondId);
    pairedWith.set(secondId, firstId);
  }

  const rendered = new Set<string>();
  return categories.flatMap((category) => {
    if (rendered.has(category.id)) return [];
    rendered.add(category.id);
    const partnerId = pairedWith.get(category.id);
    const partner = partnerId ? categoriesById.get(partnerId) : undefined;
    if (!partner || rendered.has(partner.id)) return [[category]];
    rendered.add(partner.id);
    return [[category, partner]];
  });
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

/**
 * Center-crop a photo to a circle on a transparent PNG, for exports that
 * cannot clip images themselves (docx). Browser-only: when canvas is
 * unavailable (e.g. Node smoke tests) the original data URL is returned,
 * which simply yields a square photo there.
 */
export async function circleCropDataUrl(dataUrl: string, size = 300): Promise<string> {
  if (typeof document === 'undefined') return dataUrl;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = dataUrl;
    });
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return dataUrl;
    ctx.canvas.width = size;
    ctx.canvas.height = size;
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    if (!side) return dataUrl;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    return ctx.canvas.toDataURL('image/png');
  } catch {
    return dataUrl;
  }
}

export function slugify(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'resume';
}
