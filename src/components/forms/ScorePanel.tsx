'use client';

import { useMemo, useState } from 'react';
import { runAtsChecks, type CheckStatus } from '../../lib/analysis/atsScore';
import { estimatePages } from '../../lib/analysis/estimate';
import { toPlainText } from '../../lib/analysis/plainText';
import { useActiveResume } from '../../lib/store';
import { Button, SectionCard } from '../ui';

const ICON: Record<CheckStatus, string> = { pass: '✓', warn: '!', fail: '✕', info: 'i' };
const COLOR: Record<CheckStatus, string> = {
  pass: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  fail: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
};

export function ScorePanel() {
  const r = useActiveResume();
  const { score, checks } = useMemo(() => runAtsChecks(r), [r]);
  const pages = useMemo(() => estimatePages(r), [r]);
  const [showText, setShowText] = useState(false);
  const [copied, setCopied] = useState(false);

  const grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Needs work' : 'At risk';
  const gradeColor = score >= 85 ? 'text-emerald-700' : score >= 70 ? 'text-sky-700' : score >= 50 ? 'text-amber-700' : 'text-red-700';

  const copyText = () => {
    navigator.clipboard?.writeText(toPlainText(r)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  return (
    <div className="space-y-4">
      <SectionCard className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
            score >= 85 ? 'bg-emerald-100 text-emerald-800' : score >= 70 ? 'bg-sky-100 text-sky-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {score}
        </div>
        <div>
          <p className={`text-lg font-bold ${gradeColor}`}>{grade}</p>
          <p className="text-xs leading-snug text-slate-500">
            Estimated length: <b>{pages} page{pages === 1 ? '' : 's'}</b>. Weighted across parsing safety,
            content quality, quantification and keyword coverage.
          </p>
        </div>
      </SectionCard>

      <div className="space-y-2">
        {checks.map((c) => (
          <SectionCard key={c.id} className="flex items-start gap-3 py-2.5">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${COLOR[c.status]}`}>
              {ICON[c.status]}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{c.label}</p>
              <p className="text-xs leading-snug text-slate-600">{c.detail}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{c.why}</p>
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">ATS paste test (parse-order check)</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="xs" onClick={() => setShowText((v) => !v)}>
              {showText ? 'Hide' : 'Show'}
            </Button>
            <Button variant="secondary" size="xs" onClick={copyText}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        <p className="text-[11px] leading-snug text-slate-500">
          This is what an ATS text extractor sees - linear text in document order. Paste it into any online
          ATS checker or a plain text box to verify nothing is garbled, missing or out of order.
        </p>
        {showText && (
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-700">
            {toPlainText(r) || '(empty resume)'}
          </pre>
        )}
      </SectionCard>
    </div>
  );
}
