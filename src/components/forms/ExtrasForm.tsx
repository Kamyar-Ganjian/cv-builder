'use client';

import { uid } from '../../lib/defaults';
import { useActiveResume, useBuilder } from '../../lib/store';
import { Button, SectionCard, TextInput } from '../ui';

export function CertificationsForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  return (
    <div className="space-y-3">
      {r.certifications.map((c) => (
        <SectionCard key={c.id} className="flex flex-wrap items-end gap-2">
          <div className="min-w-44 grow">
            <TextInput label="Certification" value={c.name} onChange={(v) => update((p) => ({ ...p, certifications: p.certifications.map((x) => (x.id === c.id ? { ...x, name: v } : x)) }))} placeholder="AWS Certified Solutions Architect" />
          </div>
          <div className="w-40">
            <TextInput label="Issuer" value={c.issuer} onChange={(v) => update((p) => ({ ...p, certifications: p.certifications.map((x) => (x.id === c.id ? { ...x, issuer: v } : x)) }))} />
          </div>
          <div className="w-32">
            <TextInput label="Date" type="month" value={c.date} onChange={(v) => update((p) => ({ ...p, certifications: p.certifications.map((x) => (x.id === c.id ? { ...x, date: v } : x)) }))} />
          </div>
          <Button variant="danger" size="xs" onClick={() => update((p) => ({ ...p, certifications: p.certifications.filter((x) => x.id !== c.id) }))}>×</Button>
        </SectionCard>
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, certifications: [...p.certifications, { id: uid(), name: '', issuer: '', date: '' }] }))}>
        + Add certification
      </Button>
    </div>
  );
}

export function LanguagesForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  return (
    <div className="space-y-3">
      {r.languages.map((l) => (
        <SectionCard key={l.id} className="flex flex-wrap items-end gap-2">
          <div className="min-w-36 grow">
            <TextInput label="Language" value={l.name} onChange={(v) => update((p) => ({ ...p, languages: p.languages.map((x) => (x.id === l.id ? { ...x, name: v } : x)) }))} placeholder="German" />
          </div>
          <div className="min-w-44 grow">
            <TextInput label="Level" value={l.level} onChange={(v) => update((p) => ({ ...p, languages: p.languages.map((x) => (x.id === l.id ? { ...x, level: v } : x)) }))} placeholder="Professional working proficiency" />
          </div>
          <Button variant="danger" size="xs" onClick={() => update((p) => ({ ...p, languages: p.languages.filter((x) => x.id !== l.id) }))}>×</Button>
        </SectionCard>
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, languages: [...p.languages, { id: uid(), name: '', level: '' }] }))}>
        + Add language
      </Button>
    </div>
  );
}

export function CoursesForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  return (
    <div className="space-y-3">
      {r.courses.map((c) => (
        <SectionCard key={c.id} className="flex flex-wrap items-end gap-2">
          <div className="min-w-44 grow">
            <TextInput label="Course" value={c.name} onChange={(v) => update((p) => ({ ...p, courses: p.courses.map((x) => (x.id === c.id ? { ...x, name: v } : x)) }))} placeholder="Machine Learning Specialization" />
          </div>
          <div className="w-40">
            <TextInput label="Provider" value={c.provider} onChange={(v) => update((p) => ({ ...p, courses: p.courses.map((x) => (x.id === c.id ? { ...x, provider: v } : x)) }))} placeholder="Coursera" />
          </div>
          <div className="w-32">
            <TextInput label="Date" type="month" value={c.date} onChange={(v) => update((p) => ({ ...p, courses: p.courses.map((x) => (x.id === c.id ? { ...x, date: v } : x)) }))} />
          </div>
          <Button variant="danger" size="xs" onClick={() => update((p) => ({ ...p, courses: p.courses.filter((x) => x.id !== c.id) }))}>×</Button>
        </SectionCard>
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, courses: [...p.courses, { id: uid(), name: '', provider: '', date: '' }] }))}>
        + Add course
      </Button>
    </div>
  );
}
