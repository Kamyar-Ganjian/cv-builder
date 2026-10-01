'use client';

import { useEffect, useRef, useState } from 'react';
import { fmtDate } from '../../lib/analysis/plainText';
import { estimatePages } from '../../lib/analysis/estimate';
import { useActiveResume } from '../../lib/store';
import {
  MAIN_SECTIONS,
  SECTION_LABELS,
  SIDEBAR_SECTIONS,
  type FontFamilyOption,
  type Resume,
  type SectionId,
} from '../../lib/types';

export const FONT_STACKS: Record<FontFamilyOption, string> = {
  Arial: 'Arial, Helvetica, sans-serif',
  Calibri: 'Calibri, Carlito, "Segoe UI", sans-serif',
  Georgia: 'Georgia, "Times New Roman", serif',
  Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  'Times New Roman': '"Times New Roman", Times, serif',
};

function Head({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="mb-1 mt-3">
      <div className="font-bold uppercase" style={{ color: accent, fontSize: '1.05em', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ borderBottom: '1px solid ' + accent, opacity: 0.5, marginTop: 1 }} />
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  const list = items.filter((b) => b.trim());
  if (!list.length) return null;
  return (
    <ul className="mt-0.5 space-y-[2px]" style={{ listStyle: 'disc', paddingLeft: '1.1em' }}>
      {list.map((b, i) => (
        <li key={i} style={{ lineHeight: 1.32 }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

function SectionBody({ r, id }: { r: Resume; id: SectionId }) {
  switch (id) {
    case 'summary':
      return r.summary.trim() ? <p style={{ lineHeight: 1.35 }}>{r.summary}</p> : null;
    case 'skills':
      return (
        <div className="space-y-[3px]">
          {r.skills.filter((s) => s.skills.trim()).map((s) => (
            <p key={s.id} style={{ lineHeight: 1.3 }}>
              {s.name.trim() && <b>{s.name}: </b>}
              {s.skills}
            </p>
          ))}
        </div>
      );
    case 'experience':
      return (
        <div className="space-y-2.5">
          {r.experience.filter((e) => e.title.trim() || e.company.trim()).map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-2">
                <b>
                  {e.title}
                  {e.title && e.company && ', '}
                  {e.company}
                </b>
                <span className="shrink-0" style={{ fontSize: '0.92em' }}>
                  {fmtDate(e.startDate)}{(e.startDate || e.endDate || e.current) && ' - '}
                  {e.current ? 'Present' : fmtDate(e.endDate)}
                </span>
              </div>
              {e.location && <div style={{ fontSize: '0.92em', color: '#475569' }}>{e.location}</div>}
              <Bullets items={e.bullets} />
            </div>
          ))}
        </div>
      );
    case 'education':
      return (
        <div className="space-y-2">
          {r.education.filter((e) => e.school.trim() || e.degree.trim()).map((e) => (
            <div key={e.id}>
              <div className="flex items-baseline justify-between gap-2">
                <b>{[e.degree, e.field].filter(Boolean).join(', ')}</b>
                <span className="shrink-0" style={{ fontSize: '0.92em' }}>
                  {fmtDate(e.startDate)}{e.startDate && e.endDate && ' - '}{fmtDate(e.endDate)}
                </span>
              </div>
              <div>{[e.school, e.location].filter(Boolean).join(', ')}</div>
              {e.details.trim() && <div style={{ fontSize: '0.92em', color: '#475569' }}>{e.details}</div>}
            </div>
          ))}
        </div>
      );
    case 'projects':
      return (
        <div className="space-y-2">
          {r.projects.filter((p) => p.name.trim()).map((p) => (
            <div key={p.id}>
              <div className="flex items-baseline justify-between gap-2">
                <b>{p.name}</b>
                {p.link && <span className="shrink-0" style={{ fontSize: '0.92em' }}>{p.link}</span>}
              </div>
              {p.tech.trim() && <div style={{ fontSize: '0.92em', color: '#475569' }}>Tech: {p.tech}</div>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </div>
      );
    case 'certifications':
      return (
        <div className="space-y-[3px]">
          {r.certifications.filter((c) => c.name.trim()).map((c) => (
            <p key={c.id} style={{ lineHeight: 1.3 }}>
              <b>{c.name}</b>
              {[c.issuer, fmtDate(c.date)].filter(Boolean).length > 0 && ' - '}
              {[c.issuer, fmtDate(c.date)].filter(Boolean).join(', ')}
            </p>
          ))}
        </div>
      );
    case 'languages':
      return (
        <p style={{ lineHeight: 1.3 }}>
          {r.languages.filter((l) => l.name.trim()).map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(', ')}
        </p>
      );
    case 'courses':
      return (
        <div className="space-y-[3px]">
          {r.courses.filter((c) => c.name.trim()).map((c) => (
            <p key={c.id} style={{ lineHeight: 1.3 }}>
              <b>{c.name}</b>
              {[c.provider, fmtDate(c.date)].filter(Boolean).length > 0 && ' - '}
              {[c.provider, fmtDate(c.date)].filter(Boolean).join(', ')}
            </p>
          ))}
        </div>
      );
  }
}

function renderSection(r: Resume, id: SectionId) {
  const body = <SectionBody r={r} id={id} />;
  // Cheap emptiness check per section type happens inside SectionBody; skip if hidden.
  return (
    <section key={id}>
      <Head label={SECTION_LABELS[id]} accent={r.settings.accent} />
      {body}
    </section>
  );
}

export function ResumePreview() {
  const r = useActiveResume();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);

  const MM = 96 / 25.4;
  const pageW = r.settings.pageSize === 'A4' ? 210 : 215.9;
  const pageH = r.settings.pageSize === 'A4' ? 297 : 279.4;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / (pageW * (96 / 25.4))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageW]);

  const visible = r.settings.sectionOrder.filter((s) => !r.settings.hiddenSections.includes(s));
  const mainIds = visible.filter((s) => MAIN_SECTIONS.includes(s));
  const sideIds = visible.filter((s) => SIDEBAR_SECTIONS.includes(s));
  const pages = estimatePages(r);
  const photo = r.settings.showPhoto && r.settings.photoDataUrl;

  const contactLine = [r.contact.email, r.contact.phone, r.contact.location].filter(Boolean);
  const linkLine = [r.contact.linkedin, r.contact.website].filter(Boolean);

  return (
    <div>
      <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ height: pageH * MM * scale }}>
        <div
          className="origin-top-left bg-white text-slate-900 shadow-2xl ring-1 ring-slate-200"
          style={{
            width: `${pageW}mm`,
            minHeight: `${pageH}mm`,
            transform: `scale(${scale})`,
            fontFamily: FONT_STACKS[r.settings.fontFamily],
            fontSize: `${r.settings.fontSize}pt`,
            padding: `${r.settings.margin}in`,
            lineHeight: 1.3,
          }}
        >
          {/* Contact block - always in the document body, never a header/footer */}
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-bold" style={{ fontSize: '1.9em', color: r.settings.accent, lineHeight: 1.15 }}>
                {r.contact.fullName || 'Your Name'}
              </div>
              {r.contact.jobTitle && (
                <div className="mt-[2px] font-semibold" style={{ fontSize: '1.15em', color: '#334155' }}>
                  {r.contact.jobTitle}
                </div>
              )}
              <div className="mt-1 space-y-[1px]" style={{ fontSize: '0.95em' }}>
                {contactLine.length > 0 && <div>{contactLine.join('  |  ')}</div>}
                {linkLine.length > 0 && <div>{linkLine.join('  |  ')}</div>}
              </div>
            </div>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.settings.photoDataUrl!}
                alt=""
                className="shrink-0 rounded-full object-cover"
                style={{ width: '30mm', height: '30mm' }}
              />
            )}
          </header>

          {r.settings.layout === 'single' ? (
            visible.map((id) => renderSection(r, id))
          ) : (
            <div className="flex gap-5">
              <div className="min-w-0 flex-1">{mainIds.map((id) => renderSection(r, id))}</div>
              {sideIds.length > 0 && <div className="w-[31%] shrink-0">{sideIds.map((id) => renderSection(r, id))}</div>}
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Estimated length: ~{pages} page{pages === 1 ? '' : 's'}. PDF export paginates automatically.
        {pages > 1 && ' Page 1 shown above.'}
      </p>
    </div>
  );
}
