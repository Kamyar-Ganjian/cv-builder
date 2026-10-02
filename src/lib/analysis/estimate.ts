import { SIDEBAR_SECTIONS, type Resume, type SectionId } from '../types';

/**
 * Heuristic page-count estimate. The live preview measures its own rendered
 * height; this estimate is also used by analysis panels where no DOM exists.
 */
export function estimatePages(r: Resume): number {
  const pageW = r.settings.pageSize === 'Letter' ? 8.5 : 8.27; // inches
  const pageH = r.settings.pageSize === 'Letter' ? 11 : 11.69;
  const usableW = pageW - r.settings.margin * 2;
  const usableH = pageH - r.settings.margin * 2;

  // Average glyph width ~0.48em for the allowed fonts; pt -> inches is /72.
  const charW = (r.settings.fontSize / 72) * 0.48;
  const charsPerLine = Math.max(40, Math.floor(usableW / charW));
  // Match the 1.32 line height used by both the preview and PDF export.
  const lineH = (r.settings.fontSize / 72) * 1.32;
  const linesPerPage = Math.floor(usableH / lineH);

  let mainLines = 0;
  let sidebarLines = 0;
  const wrap = (text: string, indent = 0) =>
    Math.max(1, Math.ceil(text.length / (charsPerLine - indent)));
  const add = (id: SectionId, lines: number) => {
    if (r.settings.layout === 'hybrid' && SIDEBAR_SECTIONS.includes(id)) sidebarLines += lines;
    else mainLines += lines;
  };

  const visible = r.settings.sectionOrder.filter((s) => !r.settings.hiddenSections.includes(s));
  const headingCost = 2.1;

  for (const id of visible) {
    switch (id) {
      case 'summary':
        if (r.summary.trim()) {
          add(id, headingCost + wrap(r.summary));
        }
        break;
      case 'skills': {
        const rows = r.skills.filter((s) => s.skills.trim());
        if (rows.length) {
          add(id, headingCost + rows.reduce((a, s) => a + wrap(`${s.name}: ${s.skills}`), 0));
        }
        break;
      }
      case 'experience': {
        const items = r.experience.filter((e) => e.title.trim() || e.company.trim());
        if (items.length) {
          let itemLines = headingCost;
          for (const e of items) {
            itemLines += 2.6; // header + location + spacing
            itemLines += e.bullets.filter((b) => b.trim()).reduce((a, b) => a + wrap(b, 6) + 0.25, 0);
          }
          add(id, itemLines);
        }
        break;
      }
      case 'education': {
        const items = r.education.filter((e) => e.school.trim() || e.degree.trim());
        if (items.length) {
          add(
            id,
            headingCost +
              items.length * 2.4 +
              items.reduce((a, e) => a + (e.details.trim() ? wrap(e.details) : 0), 0)
          );
        }
        break;
      }
      case 'projects': {
        const items = r.projects.filter((p) => p.name.trim());
        if (items.length) {
          let itemLines = headingCost;
          for (const p of items) {
            itemLines += 1.8;
            itemLines += p.bullets.filter((b) => b.trim()).reduce((a, b) => a + wrap(b, 6) + 0.25, 0);
          }
          add(id, itemLines);
        }
        break;
      }
      case 'certifications': {
        const items = r.certifications.filter((c) => c.name.trim());
        if (items.length) {
          add(id, headingCost + items.reduce((a, c) => a + wrap([c.name, c.issuer, c.date].filter(Boolean).join(' - ')), 0));
        }
        break;
      }
      case 'languages': {
        const items = r.languages.filter((l) => l.name.trim());
        if (items.length) {
          add(id, headingCost + wrap(items.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(', ')));
        }
        break;
      }
      case 'courses': {
        const items = r.courses.filter((c) => c.name.trim());
        if (items.length) {
          add(id, headingCost + items.reduce((a, c) => a + wrap([c.name, c.provider, c.date].filter(Boolean).join(' - ')), 0));
        }
        break;
      }
    }
  }

  // Hybrid columns start at the same vertical position; the taller column controls pagination.
  const lines = 5 + (r.settings.layout === 'hybrid' ? Math.max(mainLines, sidebarLines) : mainLines + sidebarLines);
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
