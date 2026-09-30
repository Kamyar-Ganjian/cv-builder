'use client';

import { useMemo } from 'react';
import { extractKeywords, keywordCoverage, resumeToText } from '../../lib/analysis/keywords';
import { useActiveResume, useBuilder } from '../../lib/store';
import { Button, InfoBox, SectionCard, TextArea } from '../ui';

export function JDPanel() {
  const r = useActiveResume();
  const updateSettings = useBuilder((s) => s.updateSettings);
  const jd = r.settings.jobDescription;

  const { keywords, coverage } = useMemo(() => {
    const keywords = extractKeywords(jd);
    const coverage = keywordCoverage(resumeToText(r), keywords);
    return { keywords, coverage };
  }, [jd, r]);

  const copyMissing = () => {
    const text = coverage.missing.map((k) => k.term).join(', ');
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  return (
    <div className="space-y-3">
      <InfoBox tone="info">
        Paste the target job description. The app extracts its keywords and checks which ones your resume
        already contains - <b>mirror exact phrasing naturally</b> in your summary, skills and bullets. No
        stuffing, no hidden text.
      </InfoBox>
      <SectionCard>
        <TextArea
          label="Job description"
          value={jd}
          onChange={(v) => updateSettings({ jobDescription: v })}
          placeholder="Paste the full job posting here…"
          rows={8}
        />
      </SectionCard>
      {jd.trim() && (
        <SectionCard className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Keyword coverage</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${
                coverage.percent >= 70
                  ? 'bg-emerald-100 text-emerald-800'
                  : coverage.percent >= 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {coverage.percent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all ${coverage.percent >= 70 ? 'bg-emerald-500' : coverage.percent >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${coverage.percent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {coverage.matched.length}/{keywords.length} extracted keywords found in your resume. Skills are
            weighted double - target ≥70%.
          </p>
          {coverage.missing.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Missing ({coverage.missing.length})
                </p>
                <Button variant="ghost" size="xs" onClick={copyMissing}>Copy list</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {coverage.missing.map((k) => (
                  <span key={k.term} className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-800">
                    {k.term}
                    {k.kind === 'skill' && <span className="ml-1 font-semibold">·skill</span>}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-snug text-slate-500">
                Add the ones you genuinely have to your Skills section (exact phrasing) and weave others into
                bullets where truthful.
              </p>
            </div>
          )}
          {coverage.matched.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Covered ({coverage.matched.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {coverage.matched.map((k) => (
                  <span key={k.term} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-800">
                    {k.term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
