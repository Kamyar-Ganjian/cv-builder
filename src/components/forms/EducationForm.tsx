'use client';

import { newEducation, newProject } from '../../lib/defaults';
import { useActiveResume, useBuilder } from '../../lib/store';
import type { EducationItem, ProjectItem } from '../../lib/types';
import { Button, SectionCard, TextInput, TextArea } from '../ui';

export function EducationForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  const set = (id: string, patch: Partial<EducationItem>) =>
    update((p) => ({ ...p, education: p.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  return (
    <div className="space-y-3">
      {r.education.map((e) => (
        <SectionCard key={e.id} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{e.school || 'New education'}</span>
            <Button variant="danger" size="xs" onClick={() => update((p) => ({ ...p, education: p.education.filter((x) => x.id !== e.id) }))}>
              Delete
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <TextInput label="School" value={e.school} onChange={(v) => set(e.id, { school: v })} placeholder="University of Washington" />
            <TextInput label="Location" value={e.location} onChange={(v) => set(e.id, { location: v })} placeholder="Seattle, WA" />
            <TextInput label="Degree" value={e.degree} onChange={(v) => set(e.id, { degree: v })} placeholder="B.S." />
            <TextInput label="Field of study" value={e.field} onChange={(v) => set(e.id, { field: v })} placeholder="Computer Science" />
            <TextInput label="Start" type="month" value={e.startDate} onChange={(v) => set(e.id, { startDate: v })} />
            <div>
              <TextInput label="End" type="month" value={e.endDate} onChange={(v) => set(e.id, { endDate: v })} />
              <label className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                <input type="checkbox" checked={e.current} onChange={(event) => set(e.id, { current: event.target.checked, endDate: event.target.checked ? '' : e.endDate })} />
                Currently studying
              </label>
            </div>
          </div>
          <TextArea
            label="Details (optional)"
            hint="Honors, GPA (only if strong + recent), relevant coursework. Skip for senior roles."
            value={e.details}
            onChange={(v) => set(e.id, { details: v })}
            rows={2}
          />
        </SectionCard>
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, education: [...p.education, newEducation()] }))}>
        + Add education
      </Button>
    </div>
  );
}

export function ProjectsForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  const set = (id: string, patch: Partial<ProjectItem>) =>
    update((p) => ({ ...p, projects: p.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  return (
    <div className="space-y-3">
      {r.projects.map((pjt) => (
        <SectionCard key={pjt.id} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{pjt.name || 'New project'}</span>
            <Button variant="danger" size="xs" onClick={() => update((p) => ({ ...p, projects: p.projects.filter((x) => x.id !== pjt.id) }))}>
              Delete
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <TextInput label="Project name" value={pjt.name} onChange={(v) => set(pjt.id, { name: v })} />
            <TextInput label="Link (optional)" value={pjt.link} onChange={(v) => set(pjt.id, { link: v })} placeholder="github.com/you/project" />
          </div>
          <TextInput label="Tech stack" value={pjt.tech} onChange={(v) => set(pjt.id, { tech: v })} placeholder="Next.js, PostgreSQL, Tailwind" />
          {pjt.bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={b}
                rows={2}
                onChange={(e) => set(pjt.id, { bullets: pjt.bullets.map((x, xi) => (xi === i ? e.target.value : x)) })}
                placeholder="Built a real-time dashboard used by 3K monthly users…"
                className="w-full resize-y rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-slate-500"
              />
              <Button variant="danger" size="xs" onClick={() => set(pjt.id, { bullets: pjt.bullets.filter((_, xi) => xi !== i) })}>×</Button>
            </div>
          ))}
          <Button variant="secondary" size="xs" onClick={() => set(pjt.id, { bullets: [...pjt.bullets, ''] })}>
            + Add bullet
          </Button>
        </SectionCard>
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, projects: [...p.projects, newProject()] }))}>
        + Add project
      </Button>
    </div>
  );
}
