'use client';

import { newSkillCategory, uid } from '../../lib/defaults';
import { useActiveResume, useBuilder } from '../../lib/store';
import { Button, InfoBox, SectionCard, Select, TextInput } from '../ui';

export function SkillsForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  const total = r.skills.reduce((a, s) => a + s.skills.split(',').filter((x) => x.trim()).length, 0);

  return (
    <div className="space-y-3">
      <InfoBox tone="info">
        8-20 relevant hard skills, categorized (Languages, Frontend, Tools &amp; DevOps…).{' '}
        <b>Copy exact phrasing from the job description</b> - ATS keyword matching is literal. No skill bars or
        star ratings: parsers ignore them and recruiters distrust them.
      </InfoBox>
      <InfoBox tone="warn">
        Use Category layout to place two categories side by side in the PDF. DOCX keeps categories stacked for safer
        ATS parsing; columns may be harder for some ATS to read.
      </InfoBox>
      {r.skills.map((cat, i) => (
        <SectionCard key={cat.id} className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-40 shrink-0">
              <TextInput
                label="Category"
                value={cat.name}
                onChange={(v) =>
                  update((p) => ({
                    ...p,
                    skills: p.skills.map((s) => (s.id === cat.id ? { ...s, name: v } : s)),
                  }))
                }
                placeholder="Frontend"
              />
            </div>
            <div className="grow">
              <TextInput
                label="Skills (comma-separated)"
                value={cat.skills}
                onChange={(v) =>
                  update((p) => ({
                    ...p,
                    skills: p.skills.map((s) => (s.id === cat.id ? { ...s, skills: v } : s)),
                  }))
                }
                placeholder="React, Next.js, TypeScript"
              />
            </div>
            <div className="pt-5">
              <Button
                variant="danger"
                size="xs"
                title="Remove category"
                onClick={() =>
                  update((p) => ({
                    ...p,
                    skills: p.skills.filter((s) => s.id !== cat.id),
                    skillPairs: (p.skillPairs ?? []).filter((pair) => !pair.includes(cat.id)),
                  }))
                }
              >
                Remove
              </Button>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="w-56">
              <Select
                label="Category layout"
                value={r.skillPairs?.find((pair) => pair.includes(cat.id))?.find((id) => id !== cat.id) ?? ''}
                onChange={(partnerId) =>
                  update((p) => {
                    const pairs = (p.skillPairs ?? []).filter(
                      (pair) => !pair.includes(cat.id) && (!partnerId || !pair.includes(partnerId))
                    );
                    if (partnerId) pairs.push([cat.id, partnerId]);
                    return { ...p, skillPairs: pairs };
                  })
                }
                options={[
                  { value: '', label: 'Full width' },
                  ...r.skills.filter((other) => other.id !== cat.id).map((other) => ({
                    value: other.id,
                    label: `Beside ${other.name.trim() || 'Untitled category'}`,
                  })),
                ]}
              />
            </div>
            {r.skillPairs?.some((pair) => pair.includes(cat.id)) && (
              <p className="pb-2 text-[11px] text-slate-500">Paired categories share the available width.</p>
            )}
          </div>
          {i === 0 && (
            <p className="text-[11px] text-slate-400">
              {total} skills total {total > 20 ? '- too many, ranking dilutes.' : total < 8 ? '- aim for at least 8.' : ''}
            </p>
          )}
        </SectionCard>
      ))}
      <Button variant="secondary" onClick={() => update((p) => ({ ...p, skills: [...p.skills, { ...newSkillCategory(), id: uid() }] }))}>
        + Add category
      </Button>
    </div>
  );
}
