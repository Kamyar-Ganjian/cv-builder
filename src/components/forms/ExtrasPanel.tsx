'use client';

import { useActiveResume, useBuilder } from '../../lib/store';
import { SECTION_LABELS, type SectionId } from '../../lib/types';
import { CertificationsForm, CoursesForm, LanguagesForm } from '../forms/ExtrasForm';
import { ProjectsForm } from '../forms/EducationForm';
import { InfoBox } from '../ui';

function VisibilityToggle({ id }: { id: SectionId }) {
  const r = useActiveResume();
  const updateSettings = useBuilder((s) => s.updateSettings);
  const hidden = r.settings.hiddenSections.includes(id);
  return (
    <button
      type="button"
      onClick={() => updateSettings({ hiddenSections: hidden ? r.settings.hiddenSections.filter((h) => h !== id) : [...r.settings.hiddenSections, id] })}
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${hidden ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}
    >
      {hidden ? 'Hidden on resume' : 'Shown on resume'}
    </button>
  );
}

export function ExtrasPanel() {
  return (
    <div className="space-y-5">
      <InfoBox tone="info">
        Optional sections earn their place only when relevant. Projects help early-career candidates;
        certifications/languages matter when the job asks for them. Toggle visibility per section.
      </InfoBox>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{SECTION_LABELS.projects}</h3>
          <VisibilityToggle id="projects" />
        </div>
        <ProjectsForm />
      </section>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{SECTION_LABELS.certifications}</h3>
          <VisibilityToggle id="certifications" />
        </div>
        <CertificationsForm />
      </section>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{SECTION_LABELS.languages}</h3>
          <VisibilityToggle id="languages" />
        </div>
        <LanguagesForm />
      </section>
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{SECTION_LABELS.courses}</h3>
          <VisibilityToggle id="courses" />
        </div>
        <CoursesForm />
      </section>
    </div>
  );
}
