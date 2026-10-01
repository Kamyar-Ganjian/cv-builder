import { MAIN_SECTIONS, SECTION_LABELS, SIDEBAR_SECTIONS, type Resume, type SectionId } from '../types';
import { getContactLinks } from '../contactLinks';

/**
 * Simulates what an ATS text extractor sees: pure linear text in document order.
 * Used for the "paste test" panel so users can verify parse order and content.
 */
export function toPlainText(r: Resume): string {
  const lines: string[] = [];
  const c = r.contact;
  if (c.fullName) lines.push(c.fullName.toUpperCase());
  if (c.jobTitle) lines.push(c.jobTitle);
  const contactLine = [c.email, c.phone, c.location, ...getContactLinks(c).map((link) => link.text)].filter(Boolean).join(' | ');
  if (contactLine) lines.push(contactLine);
  lines.push('');

  const orderedSections = orderedSectionIds(r);

  for (const id of orderedSections) {
    if (r.settings.hiddenSections.includes(id)) continue;
    const content = sectionPlainText(r, id);
    if (!content) continue;
    lines.push(SECTION_LABELS[id].toUpperCase());
    lines.push(content);
    lines.push('');
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Document/extraction order. Hybrid renders the main column first, then the
 * sidebar sections - matching how the PDF draws text (main-first), so heading
 * mapping stays logical even though the sidebar sits top-right visually.
 */
export function orderedSectionIds(r: Resume): SectionId[] {
  if (r.settings.layout === 'hybrid') {
    const main = r.settings.sectionOrder.filter((s) => MAIN_SECTIONS.includes(s));
    const sidebar = r.settings.sectionOrder.filter((s) => SIDEBAR_SECTIONS.includes(s));
    return [...main, ...sidebar];
  }
  return r.settings.sectionOrder;
}

function sectionPlainText(r: Resume, id: SectionId): string | null {
  switch (id) {
    case 'summary':
      return r.summary.trim() || null;
    case 'skills': {
      const rows = r.skills
        .filter((s) => s.skills.trim())
        .map((s) => (s.name.trim() ? `${s.name.trim()}: ${s.skills.trim()}` : s.skills.trim()));
      return rows.length ? rows.join('\n') : null;
    }
    case 'experience': {
      const rows = r.experience
        .filter((e) => e.title.trim() || e.company.trim())
        .map((e) => {
          const dates = `${fmtDate(e.startDate)} - ${e.current ? 'Present' : fmtDate(e.endDate)}`;
          const head = [e.title, e.company].filter(Boolean).join(', ');
          const loc = e.location ? ` | ${e.location}` : '';
          const bullets = e.bullets.filter((b) => b.trim()).map((b) => `- ${b.trim()}`);
          return [`${head}${loc}`, dates, ...bullets].filter(Boolean).join('\n');
        });
      return rows.length ? rows.join('\n\n') : null;
    }
    case 'education': {
      const rows = r.education
        .filter((e) => e.school.trim() || e.degree.trim())
        .map((e) => {
          const deg = [e.degree, e.field].filter(Boolean).join(', ');
          const dates = `${fmtDate(e.startDate)} - ${fmtDate(e.endDate)}`.replace(/^ - $/, '');
          return [deg, e.school + (e.location ? `, ${e.location}` : ''), dates, e.details.trim()]
            .filter(Boolean)
            .join('\n');
        });
      return rows.length ? rows.join('\n\n') : null;
    }
    case 'projects': {
      const rows = r.projects
        .filter((p) => p.name.trim())
        .map((p) => {
          const head = [p.name, p.link].filter(Boolean).join(' | ');
          const tech = p.tech.trim() ? `Tech: ${p.tech.trim()}` : '';
          const bullets = p.bullets.filter((b) => b.trim()).map((b) => `- ${b.trim()}`);
          return [head, tech, ...bullets].filter(Boolean).join('\n');
        });
      return rows.length ? rows.join('\n\n') : null;
    }
    case 'certifications': {
      const rows = r.certifications
        .filter((c) => c.name.trim())
        .map((c) => [c.name, c.issuer, fmtDate(c.date)].filter(Boolean).join(', '));
      return rows.length ? rows.join('\n') : null;
    }
    case 'languages': {
      const rows = r.languages.filter((l) => l.name.trim()).map((l) => [l.name, l.level].filter(Boolean).join(' - '));
      return rows.length ? rows.join(', ') : null;
    }
    case 'courses': {
      const rows = r.courses.filter((c) => c.name.trim()).map((c) => [c.name, c.provider, fmtDate(c.date)].filter(Boolean).join(', '));
      return rows.length ? rows.join('\n') : null;
    }
  }
}

export function fmtDate(d: string): string {
  if (!d) return '';
  const m = d.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mi = parseInt(m[2], 10);
    if (mi >= 1 && mi <= 12) return `${months[mi - 1]} ${m[1]}`;
  }
  return d;
}
