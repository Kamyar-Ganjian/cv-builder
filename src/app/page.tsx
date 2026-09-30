'use client';

import { useState, useSyncExternalStore } from 'react';
import { ContactForm } from '../components/forms/ContactForm';
import { DesignPanel } from '../components/forms/DesignPanel';
import { EducationForm } from '../components/forms/EducationForm';
import { ExperienceForm } from '../components/forms/ExperienceForm';
import { ExtrasPanel } from '../components/forms/ExtrasPanel';
import { JDPanel } from '../components/forms/JDPanel';
import { ScorePanel } from '../components/forms/ScorePanel';
import { SkillsForm } from '../components/forms/SkillsForm';
import { SummaryForm } from '../components/forms/SummaryForm';
import { ExportButtons } from '../components/export/ExportButtons';
import { ResumePreview } from '../components/preview/ResumePreview';
import { ResumeManager } from '../components/ResumeManager';

type TabId = 'basics' | 'experience' | 'skills' | 'education' | 'extras' | 'design' | 'jd' | 'score';

const TABS: { id: TabId; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'extras', label: 'More' },
  { id: 'design', label: 'Design & Photo' },
  { id: 'jd', label: 'Job Match' },
  { id: 'score', label: 'ATS Check' },
];

const emptySubscribe = () => () => {};

export default function BuilderPage() {
  // Hydration gate: false on server, true on client (store hydrates from localStorage).
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [tab, setTab] = useState<TabId>('basics');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading builder…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">CV</span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">ATS Resume Builder</p>
              <p className="text-[10px] text-slate-400">Built for parsers and the 6-second scan</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ResumeManager />
            <ExportButtons />
          </div>
        </div>
        {/* Mobile editor/preview switch */}
        <div className="flex border-t border-slate-100 lg:hidden">
          {(['edit', 'preview'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMobileView(v)}
              className={`flex-1 py-2 text-sm font-medium ${mobileView === v ? 'border-b-2 border-slate-800 text-slate-900' : 'text-slate-400'}`}
            >
              {v === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(380px,5fr)_7fr]">
        {/* Editor column */}
        <div className={mobileView === 'edit' ? 'block' : 'hidden lg:block'}>
          <nav className="mb-4 flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === t.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="pb-16">
            {tab === 'basics' && (
              <div className="space-y-6">
                <ContactForm />
                <SummaryForm />
              </div>
            )}
            {tab === 'experience' && <ExperienceForm />}
            {tab === 'skills' && <SkillsForm />}
            {tab === 'education' && <EducationForm />}
            {tab === 'extras' && <ExtrasPanel />}
            {tab === 'design' && <DesignPanel />}
            {tab === 'jd' && <JDPanel />}
            {tab === 'score' && <ScorePanel />}
          </div>
        </div>

        {/* Preview column */}
        <div className={mobileView === 'preview' ? 'block' : 'hidden lg:block'}>
          <div className="lg:sticky lg:top-20">
            <ResumePreview />
            <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
              Grounded in Jobscan ATS research, Ladders eye-tracking, Harvard/Yale career guides and Google&apos;s
              XYZ formula - see RESEARCH.md.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
