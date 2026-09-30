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
        <TextInput label="LinkedIn" value={r.contact.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/alexmorgan" />
        <TextInput label="Website / portfolio (optional)" value={r.contact.website} onChange={(v) => set('website', v)} placeholder="alexmorgan.dev" />
      </SectionCard>
      <Divider />
    </div>
  );
}
