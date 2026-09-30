import { Document, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { fmtDate } from '../analysis/plainText';
import { visibleSections } from './shared';
import {
  MAIN_SECTIONS,
  SECTION_LABELS,
  SIDEBAR_SECTIONS,
  type Resume,
  type SectionId,
} from '../types';

/**
 * Text-selectable PDF export. Uses PDF built-in base fonts only:
 * Arial/Calibri/Helvetica -> Helvetica; Georgia/Times New Roman -> Times-Roman.
 * Both are on the ATS-safe font list and embed cleanly everywhere.
 */
function pdfFont(family: string): string {
  return family === 'Georgia' || family === 'Times New Roman' ? 'Times-Roman' : 'Helvetica';
}

function makeStyles(r: Resume) {
  const m = r.settings.margin * 72; // inches -> pt
  const accent = r.settings.accent;
  return StyleSheet.create({
    page: {
      paddingTop: m,
      paddingBottom: m,
      paddingLeft: m,
      paddingRight: m,
      fontFamily: pdfFont(r.settings.fontFamily),
      fontSize: r.settings.fontSize,
      lineHeight: 1.32,
      color: '#111827',
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
    name: { fontSize: r.settings.fontSize * 1.85, color: accent, fontFamily: pdfFont(r.settings.fontFamily), lineHeight: 1.15 },
    title: { fontSize: r.settings.fontSize * 1.15, color: '#334155', marginTop: 2 },
    contactLine: { fontSize: r.settings.fontSize * 0.95, marginTop: 2 },
    photo: { width: 74, height: 91, borderRadius: 2, objectFit: 'cover' },
    sectionHead: {
      fontSize: r.settings.fontSize * 1.05,
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 10,
      marginBottom: 3,
      paddingBottom: 1,
      borderBottomWidth: 0.75,
      borderBottomColor: accent,
    },
    entryHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    bold: { fontWeight: 'bold' },
    small: { fontSize: r.settings.fontSize * 0.92 },
    muted: { color: '#475569', fontSize: r.settings.fontSize * 0.92 },
    bullet: { flexDirection: 'row', paddingLeft: 8, marginTop: 1.5 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1, lineHeight: 1.32 },
    row: { flexDirection: 'row', marginTop: 2 },
    mainCol: { flex: 1, paddingRight: 14 },
    sideCol: { width: '31%' },
    link: { color: '#111827', textDecoration: 'none' },
  });
}

type S = ReturnType<typeof makeStyles>;

function SectionHead({ label, s }: { label: string; s: S }) {
  return <Text style={s.sectionHead}>{label}</Text>;
}

function Bullets({ items, s }: { items: string[]; s: S }) {
  return (
    <>
      {items.filter((b) => b.trim()).map((b, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.bulletDot}>-</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

function SectionBody({ r, id, s }: { r: Resume; id: SectionId; s: S }) {
  switch (id) {
    case 'summary':
      return r.summary.trim() ? <Text>{r.summary}</Text> : null;
    case 'skills':
      return (
        <>
          {r.skills.filter((x) => x.skills.trim()).map((x) => (
            <Text key={x.id} style={{ marginTop: 2 }}>
              {x.name.trim() ? <Text style={s.bold}>{x.name}: </Text> : null}
              {x.skills}
            </Text>
          ))}
        </>
      );
    case 'experience':
      return (
        <>
          {r.experience.filter((e) => e.title.trim() || e.company.trim()).map((e) => (
            <View key={e.id} wrap={false}>
              <View style={s.entryHead}>
                <Text style={s.bold}>{[e.title, e.company].filter(Boolean).join(', ')}</Text>
                <Text style={s.small}>
                  {fmtDate(e.startDate)}
                  {e.startDate || e.endDate || e.current ? ' - ' : ''}
                  {e.current ? 'Present' : fmtDate(e.endDate)}
                </Text>
              </View>
              {e.location ? <Text style={s.muted}>{e.location}</Text> : null}
              <Bullets items={e.bullets} s={s} />
            </View>
          ))}
        </>
      );
    case 'education':
      return (
        <>
          {r.education.filter((e) => e.school.trim() || e.degree.trim()).map((e) => (
            <View key={e.id} wrap={false}>
              <View style={s.entryHead}>
                <Text style={s.bold}>{[e.degree, e.field].filter(Boolean).join(', ')}</Text>
                <Text style={s.small}>
                  {fmtDate(e.startDate)}
                  {e.startDate && e.endDate ? ' - ' : ''}
                  {fmtDate(e.endDate)}
                </Text>
              </View>
              <Text>{[e.school, e.location].filter(Boolean).join(', ')}</Text>
              {e.details.trim() ? <Text style={s.muted}>{e.details}</Text> : null}
            </View>
          ))}
        </>
      );
    case 'projects':
      return (
        <>
          {r.projects.filter((p) => p.name.trim()).map((p) => (
            <View key={p.id} wrap={false}>
              <View style={s.entryHead}>
                <Text style={s.bold}>{p.name}</Text>
                {p.link ? <Text style={s.small}>{p.link}</Text> : null}
              </View>
              {p.tech.trim() ? <Text style={s.muted}>Tech: {p.tech}</Text> : null}
              <Bullets items={p.bullets} s={s} />
            </View>
          ))}
        </>
      );
    case 'certifications':
      return (
        <>
          {r.certifications.filter((c) => c.name.trim()).map((c) => (
            <Text key={c.id} style={{ marginTop: 2 }}>
              <Text style={s.bold}>{c.name}</Text>
              {[c.issuer, fmtDate(c.date)].filter(Boolean).length > 0 ? ' - ' : ''}
              {[c.issuer, fmtDate(c.date)].filter(Boolean).join(', ')}
            </Text>
          ))}
        </>
      );
    case 'languages':
      return (
        <Text>
          {r.languages.filter((l) => l.name.trim()).map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(', ')}
        </Text>
      );
    case 'courses':
      return (
        <>
          {r.courses.filter((c) => c.name.trim()).map((c) => (
            <Text key={c.id} style={{ marginTop: 2 }}>
              <Text style={s.bold}>{c.name}</Text>
              {[c.provider, fmtDate(c.date)].filter(Boolean).length > 0 ? ' - ' : ''}
              {[c.provider, fmtDate(c.date)].filter(Boolean).join(', ')}
            </Text>
          ))}
        </>
      );
  }
}

function asUrl(v: string): string {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function PdfDocument({ resume: r }: { resume: Resume }) {
  const s = makeStyles(r);
  const visible = visibleSections(r);
  const mainIds = visible.filter((id) => MAIN_SECTIONS.includes(id));
  const sideIds = visible.filter((id) => SIDEBAR_SECTIONS.includes(id));
  const photo = r.settings.showPhoto && r.settings.photoDataUrl;

  const contactLine = [r.contact.email, r.contact.phone, r.contact.location].filter(Boolean);
  const linkLine = [r.contact.linkedin, r.contact.website].filter(Boolean);

  const renderSection = (id: SectionId) => (
    <View key={id}>
      <SectionHead label={SECTION_LABELS[id]} s={s} />
      <SectionBody r={r} id={id} s={s} />
    </View>
  );

  return (
    <Document title={`${r.contact.fullName || 'Resume'} - Resume`} author={r.contact.fullName}>
      <Page size={r.settings.pageSize === 'A4' ? 'A4' : 'LETTER'} style={s.page}>
        <View style={s.headerRow}>
          <View style={{ flex: 1, paddingRight: photo ? 10 : 0 }}>
            <Text style={s.name}>{r.contact.fullName || 'Your Name'}</Text>
            {r.contact.jobTitle ? <Text style={s.title}>{r.contact.jobTitle}</Text> : null}
            {contactLine.length > 0 ? <Text style={s.contactLine}>{contactLine.join('  |  ')}</Text> : null}
            {linkLine.length > 0 ? (
              <Text style={s.contactLine}>
                {r.contact.linkedin ? (
                  <Link src={asUrl(r.contact.linkedin)} style={s.link}>{r.contact.linkedin}</Link>
                ) : null}
                {r.contact.linkedin && r.contact.website ? '  |  ' : ''}
                {r.contact.website ? (
                  <Link src={asUrl(r.contact.website)} style={s.link}>{r.contact.website}</Link>
                ) : null}
              </Text>
            ) : null}
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
          {photo ? <Image src={r.settings.photoDataUrl!} style={s.photo} /> : null}
        </View>

        {r.settings.layout === 'single' ? (
          visible.map(renderSection)
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <View style={s.mainCol}>{mainIds.map(renderSection)}</View>
            {sideIds.length > 0 ? <View style={s.sideCol}>{sideIds.map(renderSection)}</View> : null}
          </View>
        )}
      </Page>
    </Document>
  );
}
