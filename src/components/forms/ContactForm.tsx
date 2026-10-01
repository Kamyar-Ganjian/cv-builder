'use client';

import { useActiveResume, useBuilder } from '../../lib/store';
import { Divider, InfoBox, SectionCard, TextInput } from '../ui';

export function ContactForm() {
  const r = useActiveResume();
  const update = useBuilder((s) => s.updateActive);
  const set = (k: keyof typeof r.contact, v: string) =>
    update((prev) => ({ ...prev, contact: { ...prev.contact, [k]: v } }));

  return (
    <div className="space-y-3">
      <InfoBox tone="info">
        Contact details always render in the <b>document body</b> - never a header/footer. Many ATS parsers
        silently drop header/footer content, which is how applications lose emails. (Jobscan)
      </InfoBox>
      <SectionCard className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput label="Full name" value={r.contact.fullName} onChange={(v) => set('fullName', v)} placeholder="Alex Morgan" />
        <TextInput
          label="Job title (target role)"
          hint="Mirror the title from the job description when truthful - recruiters scan for it first."
          value={r.contact.jobTitle}
          onChange={(v) => set('jobTitle', v)}
          placeholder="Senior Frontend Engineer"
        />
        <TextInput label="Email" type="email" value={r.contact.email} onChange={(v) => set('email', v)} placeholder="alex@email.com" />
        <TextInput label="Phone" value={r.contact.phone} onChange={(v) => set('phone', v)} placeholder="+1 (415) 555-0132" />
        <TextInput
          label="Location"
          hint="City, Country is enough. Full street addresses are outdated and waste a line."
          value={r.contact.location}
          onChange={(v) => set('location', v)}
          placeholder="San Francisco, CA"
        />
        <div className="space-y-2 sm:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile links (optional)</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
              Set the text shown on your resume separately from where it opens. For ATS readability, use a recognizable profile address or username as the shown text. https:// is optional.
            </p>
          </div>
          {([
            { key: 'linkedin', title: 'LinkedIn', textKey: 'linkedinText', shown: 'linkedin.com/in/username', destination: 'linkedin.com/in/username' },
            { key: 'github', title: 'GitHub', textKey: 'githubText', shown: 'github.com/username', destination: 'github.com/username' },
            { key: 'website', title: 'Portfolio', textKey: 'websiteText', shown: 'yourname.dev', destination: 'https://yourname.dev' },
          ] as const).map((link) => (
            <div key={link.key} className="grid grid-cols-1 items-end gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 sm:grid-cols-[100px_1fr_1fr]">
              <span className="pb-1 text-sm font-medium text-slate-700">{link.title}</span>
              <TextInput
                label="Shown on resume"
                value={r.contact[link.textKey]}
                onChange={(v) => set(link.textKey, v)}
                placeholder={link.shown}
              />
              <TextInput
                label="Destination URL"
                value={r.contact[link.key]}
                onChange={(v) => set(link.key, v)}
                placeholder={link.destination}
              />
            </div>
          ))}
        </div>
      </SectionCard>
      <Divider />
    </div>
  );
}
