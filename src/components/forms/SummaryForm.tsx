'use client';

import { useActiveResume, useBuilder } from '../../lib/store';
import { InfoBox, SectionCard, TextArea } from '../ui';

export function SummaryForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  const words = r.summary.trim().split(/\s+/).filter(Boolean).length;
  const ok = words > 0 && words <= 65;

  return (
    <div className="space-y-3">
      <InfoBox tone="info">
        2-4 lines max: <b>role + years + 3-5 top skills + 1-2 quantified highlights</b>. No objectives, no
        &quot;team player&quot; fluff. Recruiters give this block the most attention in the 6-8s scan. (Ladders eye-tracking)
      </InfoBox>
      <SectionCard>
        <TextArea
          label="Professional Summary"
          hint={`${words} words (~${Math.max(1, Math.round(words / 16))} lines). Target 30-55 words.`}
          value={r.summary}
          onChange={(v) => update((p) => ({ ...p, summary: v }))}
          placeholder="Senior Frontend Engineer with 7 years of experience building high-traffic React and TypeScript applications. Cut load times 43% and lifted conversion 12% for a platform serving 2M monthly users…"
          rows={4}
        />
        {words > 65 && (
          <p className="mt-2 text-xs text-amber-700">Too long - trim to ~4 lines. Every word must earn its place.</p>
        )}
        {ok && <p className="mt-2 text-xs text-emerald-700">Good length.</p>}
      </SectionCard>
    </div>
  );
}
