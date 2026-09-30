import {
  BorderStyle,
  Document,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
  TextWrappingSide,
  TextWrappingType,
  VerticalPositionRelativeFrom,
} from 'docx';
import { fmtDate } from '../analysis/plainText';
import { MAIN_SECTIONS, SECTION_LABELS, SIDEBAR_SECTIONS, type Resume, type SectionId } from '../types';
import { dataUrlImageType, dataUrlToBytes, visibleSections } from './shared';

/**
 * .docx export - the zero-risk format for legacy ATS (Taleo, iCIMS, older Workday).
 * Pure text flow: no tables, no text boxes. Photo is a right-floating image.
 */

const TWIPS_PER_INCH = 1440;

function dateRange(start: string, end: string, current: boolean): string {
  const s = fmtDate(start);
  const e = current ? 'Present' : fmtDate(end);
  if (!s && !e) return '';
  return `${s} - ${e}`;
}

export async function buildDocx(r: Resume): Promise<Blob> {
  const font = r.settings.fontFamily;
  const halfPt = Math.round(r.settings.fontSize * 2);
  const accent = r.settings.accent.replace('#', '');
  const marginTwips = Math.round(r.settings.margin * TWIPS_PER_INCH);
  const pageW = r.settings.pageSize === 'A4' ? 11906 : 12240;
  const pageH = r.settings.pageSize === 'A4' ? 16838 : 15840;
  const contentW = pageW - marginTwips * 2;

  const run = (text: string, opts: { bold?: boolean; color?: string; size?: number } = {}) =>
    new TextRun({ text, font, bold: opts.bold, color: opts.color ?? '111827', size: opts.size ?? halfPt });

  const rightTab = [{ type: TabStopType.RIGHT, position: contentW }];

  const headPara = (label: string) =>
    new Paragraph({
      children: [run(label.toUpperCase(), { bold: true, color: accent, size: halfPt + 2 })],
      border: { bottom: { color: accent, space: 1, style: BorderStyle.SINGLE, size: 6 } },
      spacing: { before: 160, after: 60 },
      keepNext: true,
    });

  const bulletPara = (text: string) =>
    new Paragraph({
      children: [run(text)],
      bullet: { level: 0 },
      spacing: { after: 20 },
    });

  const entryHead = (left: string, right: string) =>
    new Paragraph({
      children: [run(left, { bold: true }), ...(right ? [new TextRun({ text: '\t' }), run(right, { size: halfPt - 1 })] : [])],
      tabStops: right ? rightTab : undefined,
      spacing: { before: 100, after: 10 },
      keepNext: true,
    });

  const sectionBody = (id: SectionId): Paragraph[] => {
    switch (id) {
      case 'summary':
        return [new Paragraph({ children: [run(r.summary)], spacing: { after: 40 } })];
      case 'skills':
        return r.skills.filter((x) => x.skills.trim()).map(
          (x) =>
            new Paragraph({
              children: [...(x.name.trim() ? [run(`${x.name}: `, { bold: true })] : []), run(x.skills)],
              spacing: { after: 20 },
            })
        );
      case 'experience':
        return r.experience.filter((e) => e.title.trim() || e.company.trim()).flatMap((e) => {
          const paras: Paragraph[] = [entryHead([e.title, e.company].filter(Boolean).join(', '), dateRange(e.startDate, e.endDate, e.current))];
          if (e.location) paras.push(new Paragraph({ children: [run(e.location, { color: '475569', size: halfPt - 1 })], spacing: { after: 10 }, keepNext: true }));
          paras.push(...e.bullets.filter((b) => b.trim()).map((b) => bulletPara(b)));
          return paras;
        });
      case 'education':
        return r.education.filter((e) => e.school.trim() || e.degree.trim()).flatMap((e) => {
          const paras: Paragraph[] = [entryHead([e.degree, e.field].filter(Boolean).join(', '), dateRange(e.startDate, e.endDate, false))];
          paras.push(new Paragraph({ children: [run([e.school, e.location].filter(Boolean).join(', '))], spacing: { after: 20 } }));
          if (e.details.trim()) paras.push(new Paragraph({ children: [run(e.details, { color: '475569', size: halfPt - 1 })], spacing: { after: 20 } }));
          return paras;
        });
      case 'projects':
        return r.projects.filter((p) => p.name.trim()).flatMap((p) => {
          const paras: Paragraph[] = [entryHead(p.name, p.link)];
          if (p.tech.trim()) paras.push(new Paragraph({ children: [run(`Tech: ${p.tech}`, { color: '475569', size: halfPt - 1 })], spacing: { after: 10 }, keepNext: true }));
          paras.push(...p.bullets.filter((b) => b.trim()).map((b) => bulletPara(b)));
          return paras;
        });
      case 'certifications':
        return r.certifications.filter((c) => c.name.trim()).map(
          (c) =>
            new Paragraph({
              children: [
                run(c.name, { bold: true }),
                ...([c.issuer, fmtDate(c.date)].filter(Boolean).length ? [run(` - ${[c.issuer, fmtDate(c.date)].filter(Boolean).join(', ')}`)] : []),
              ],
              spacing: { after: 20 },
            })
        );
      case 'languages':
        return [
          new Paragraph({
            children: [run(r.languages.filter((l) => l.name.trim()).map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(', '))],
            spacing: { after: 20 },
          }),
        ];
      case 'courses':
        return r.courses.filter((c) => c.name.trim()).map(
          (c) =>
            new Paragraph({
              children: [
                run(c.name, { bold: true }),
                ...([c.provider, fmtDate(c.date)].filter(Boolean).length ? [run(` - ${[c.provider, fmtDate(c.date)].filter(Boolean).join(', ')}`)] : []),
              ],
              spacing: { after: 20 },
            })
        );
    }
  };

  // --- Contact block (body, never header/footer) ---
  const photo = r.settings.showPhoto && r.settings.photoDataUrl;
  const photoRun = photo
    ? new ImageRun({
        type: dataUrlImageType(r.settings.photoDataUrl!),
        data: dataUrlToBytes(r.settings.photoDataUrl!),
        transformation: { width: 98, height: 121 },
        floating: {
          horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align: HorizontalPositionAlign.RIGHT },
          verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
          wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.LEFT },
          margins: { top: 0, bottom: 137160, left: 182880, right: 0 }, // EMU: 0.15" / 0.2"
        },
      })
    : null;

  const contactLine = [r.contact.email, r.contact.phone, r.contact.location].filter(Boolean);
  const linkLine = [r.contact.linkedin, r.contact.website].filter(Boolean);

  const headerParas: Paragraph[] = [
    new Paragraph({
      children: [...(photoRun ? [photoRun] : []), run(r.contact.fullName || 'Your Name', { bold: true, color: accent, size: halfPt * 2 })],
      spacing: { after: 30 },
    }),
  ];
  if (r.contact.jobTitle) headerParas.push(new Paragraph({ children: [run(r.contact.jobTitle, { color: '334155', size: halfPt + 4 })], spacing: { after: 30 } }));
  if (contactLine.length) headerParas.push(new Paragraph({ children: [run(contactLine.join('  |  '), { size: halfPt - 1 })], spacing: { after: 10 } }));
  if (linkLine.length) headerParas.push(new Paragraph({ children: [run(linkLine.join('  |  '), { size: halfPt - 1 })], spacing: { after: 10 } }));

  // --- Sections ---
  const visible = visibleSections(r);
  const bodyParas: Paragraph[] = [];

  if (r.settings.layout === 'single') {
    for (const id of visible) bodyParas.push(headPara(SECTION_LABELS[id]), ...sectionBody(id));
  } else {
    // DOCX has no safe two-column-without-tables construct - degrade to single
    // column with sidebar sections at the end. PDF export keeps the hybrid look.
    const main = visible.filter((id) => MAIN_SECTIONS.includes(id));
    const side = visible.filter((id) => SIDEBAR_SECTIONS.includes(id));
    for (const id of [...main, ...side]) bodyParas.push(headPara(SECTION_LABELS[id]), ...sectionBody(id));
  }

  const doc = new Document({
    creator: r.contact.fullName || 'cv-builder',
    title: `${r.contact.fullName || 'Resume'} - Resume`,
    styles: {
      default: {
        document: {
          run: { font, size: halfPt, color: '111827' },
          paragraph: { spacing: { line: 317 } }, // ~1.32 line height (240 = single)
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: pageW, height: pageH },
            margin: { top: marginTwips, right: marginTwips, bottom: marginTwips, left: marginTwips },
          },
        },
        children: [...headerParas, ...bodyParas],
      },
    ],
  });

  return Packer.toBlob(doc);
}
