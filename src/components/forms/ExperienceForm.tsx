'use client';

import { analyzeBullet } from '../../lib/analysis/bullets';
import { newExperience } from '../../lib/defaults';
import { useActiveResume, useBuilder } from '../../lib/store';
import type { ExperienceItem } from '../../lib/types';
import { Button, InfoBox, SectionCard, TextInput } from '../ui';

function BulletRow({
  expId,
  index,
  value,
}: {
  expId: string;
  index: number;
  value: string;
}) {
  const update = useBuilder((s) => s.updateActive);
  const a = analyzeBullet(value);

  const setBullet = (v: string) =>
    update((p) => ({
      ...p,
      experience: p.experience.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => (i === index ? v : b)) } : e
      ),
    }));

  const remove = () =>
    update((p) => ({
      ...p,
      experience: p.experience.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== index) } : e
      ),
    }));

  const move = (dir: -1 | 1) =>
    update((p) => ({
      ...p,
      experience: p.experience.map((e) => {
        if (e.id !== expId) return e;
        const bs = [...e.bullets];
        const j = index + dir;
        if (j < 0 || j >= bs.length) return e;
        [bs[index], bs[j]] = [bs[j], bs[index]];
        return { ...e, bullets: bs };
      }),
    }));

  const dot = value.trim()
    ? a.score >= 80
      ? 'bg-emerald-500'
      : a.score >= 55
        ? 'bg-amber-500'
        : 'bg-red-500'
    : 'bg-slate-300';

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2">
      <div className="flex items-start gap-2">
        <span title={`Bullet score ${a.score}/100`} className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
        <textarea
          value={value}
          rows={2}
          onChange={(e) => setBullet(e.target.value)}
          placeholder="Cut load times 43% by rebuilding checkout in Next.js, lifting conversion 12%"
          className="w-full resize-y rounded border border-slate-300 bg-white px-2 py-1.5 text-sm leading-relaxed outline-none focus:border-slate-500"
        />
        <div className="flex shrink-0 flex-col gap-0.5">
          <Button variant="ghost" size="xs" title="Move up" onClick={() => move(-1)}>↑</Button>
          <Button variant="ghost" size="xs" title="Move down" onClick={() => move(1)}>↓</Button>
          <Button variant="danger" size="xs" title="Delete bullet" onClick={remove}>×</Button>
        </div>
      </div>
      {value.trim() && a.issues.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 pl-5">
          {a.issues.map((issue, i) => (
            <li key={i} className="text-[11px] leading-snug text-amber-700">
              {issue}
              {a.hints[i] && <span className="text-slate-500"> — {a.hints[i]}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExperienceCard({ item }: { item: ExperienceItem }) {
  const update = useBuilder((s) => s.updateActive);
  const set = (patch: Partial<ExperienceItem>) =>
    update((p) => ({ ...p, experience: p.experience.map((e) => (e.id === item.id ? { ...e, ...patch } : e)) }));
  const remove = () => update((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== item.id) }));
  const move = (dir: -1 | 1) =>
    update((p) => {
      const idx = p.experience.findIndex((e) => e.id === item.id);
      const j = idx + dir;
      if (j < 0 || j >= p.experience.length) return p;
      const arr = [...p.experience];
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...p, experience: arr };
    });

  return (
    <SectionCard className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {item.company || item.title || 'New position'}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="xs" title="Move up" onClick={() => move(-1)}>↑</Button>
          <Button variant="ghost" size="xs" title="Move down" onClick={() => move(1)}>↓</Button>
          <Button variant="danger" size="xs" title="Delete position" onClick={remove}>Delete</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <TextInput label="Job title" value={item.title} onChange={(v) => set({ title: v })} placeholder="Senior Frontend Engineer" />
        <TextInput label="Company" value={item.company} onChange={(v) => set({ company: v })} placeholder="Northwind Labs" />
        <TextInput label="Location" value={item.location} onChange={(v) => set({ location: v })} placeholder="San Francisco, CA" />
        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Start" type="month" value={item.startDate} onChange={(v) => set({ startDate: v })} />
          <div>
            <TextInput label="End" type="month" value={item.endDate} onChange={(v) => set({ endDate: v })} />
            <label className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={item.current} onChange={(e) => set({ current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })} />
              Current role
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Achievement bullets (XYZ formula)
        </span>
        {item.bullets.map((b, i) => (
          <BulletRow key={i} expId={item.id} index={i} value={b} />
        ))}
        <Button variant="secondary" size="xs" onClick={() => set({ bullets: [...item.bullets, ''] })}>
          + Add bullet
        </Button>
      </div>
    </SectionCard>
  );
}

export function ExperienceForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  return (
    <div className="space-y-3">
      <InfoBox tone="info">
        Reverse-chronological, most recent first. Every bullet: <b>strong verb + what you did + measurable
        result</b> (&quot;Accomplished X, as measured by Y, by doing Z&quot; - Google&apos;s formula). Target: metrics in
        60%+ of bullets, max ~2 lines each. Never &quot;Responsible for…&quot;.
      </InfoBox>
      {r.experience.map((e) => (
        <ExperienceCard key={e.id} item={e} />
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, experience: [newExperience(), ...p.experience] }))}>
        + Add position
      </Button>
    </div>
  );
}
