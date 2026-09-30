import type { Resume } from '../types';

/**
 * Heuristic page-count estimate. Not pixel-perfect - it's guidance, so the UI
 * labels it as an estimate. Based on usable page area, font size and content volume.
 */
export function estimatePages(r: Resume): number {
  const pageW = r.settings.pageSize === 'Letter' ? 8.5 : 8.27; // inches
  const pageH = r.settings.pageSize === 'Letter' ? 11 : 11.69;
  const usableW = pageW - r.settings.margin * 2;
  const usableH = pageH - r.settings.margin * 2;

  // Average glyph width ~0.48em for the allowed fonts; pt -> inches is /72.
  const charW = (r.settings.fontSize / 72) * 0.48;
  const charsPerLine = Math.max(40, Math.floor(usableW / charW));
  const lineH = (r.settings.fontSize / 72) * 1.22;
  const linesPerPage = Math.floor(usableH / lineH);

  let lines = 5; // contact block
  const wrap = (text: string, indent = 0) =>
    Math.max(1, Math.ceil(text.length / (charsPerLine - indent)));

  const visible = r.settings.sectionOrder.filter((s) => !r.settings.hiddenSections.includes(s));
  const headingCost = 2.1;

  for (const id of visible) {
    switch (id) {
      case 'summary':
        if (r.summary.trim()) {
          lines += headingCost + wrap(r.summary);
        }
        break;
      case 'skills': {
        const rows = r.skills.filter((s) => s.skills.trim());
        if (rows.length) {
          lines += headingCost + rows.reduce((a, s) => a + wrap(`${s.name}: ${s.skills}`), 0);
        }
        break;
      }
      case 'experience': {
        const items = r.experience.filter((e) => e.title.trim() || e.company.trim());
        if (items.length) {
          lines += headingCost;
          for (const e of items) {
            lines += 2.6; // header + dates + spacing
            lines += e.bullets.filter((b) => b.trim()).reduce((a, b) => a + wrap(b, 6) + 0.25, 0);
          }
        }
        break;
      }
      case 'education': {
        const items = r.education.filter((e) => e.school.trim() || e.degree.trim());
        if (items.length) {
          lines += headingCost + items.length * 2.4;
          lines += items.reduce((a, e) => a + (e.details.trim() ? wrap(e.details) : 0), 0);
        }
        break;
      }
      case 'projects': {
        const items = r.projects.filter((p) => p.name.trim());
        if (items.length) {
          lines += headingCost;
          for (const p of items) {
            lines += 1.8;
            lines += p.bullets.filter((b) => b.trim()).reduce((a, b) => a + wrap(b, 6) + 0.25, 0);
          }
        }
        break;
      }
      case 'certifications': {
        const items = r.certifications.filter((c) => c.name.trim());
        if (items.length) lines += headingCost + items.length * 1.15;
        break;
      }
      case 'languages': {
        const items = r.languages.filter((l) => l.name.trim());
        if (items.length) lines += headingCost + 1.2;
        break;
      }
      case 'courses': {
        const items = r.courses.filter((c) => c.name.trim());
        if (items.length) lines += headingCost + items.length * 1.15;
        break;
      }
    }
  }

  // Hybrid sidebar overlaps main column vertically - reduces total height slightly.
  if (r.settings.layout === 'hybrid') lines *= 0.88;

  return Math.round((lines / linesPerPage) * 10) / 10;
}

export function yearsOfExperience(r: Resume): number {
  // Earliest start date to now (or latest end date).
  let minYear: number | null = null;
  let maxYear: number | null = null;
  for (const e of r.experience) {
    const sy = parseInt(e.startDate.slice(0, 4), 10);
    if (!isNaN(sy)) minYear = minYear === null ? sy : Math.min(minYear, sy);
    const ey = e.current ? new Date().getFullYear() : parseInt(e.endDate.slice(0, 4), 10);
    if (!isNaN(ey)) maxYear = maxYear === null ? ey : Math.max(maxYear, ey);
  }
  if (minYear === null) return 0;
  return Math.max(0, (maxYear ?? new Date().getFullYear()) - minYear);
}
