'use client';

import { COUNTRIES, PHOTO_GUIDANCE, getCountry } from '../../lib/countries';
import { estimatePages } from '../../lib/analysis/estimate';
import { ACCENT_COLORS, FONT_OPTIONS } from '../../lib/defaults';
import { useActiveResume, useBuilder } from '../../lib/store';
import { SECTION_LABELS, type FontFamilyOption, type SectionId } from '../../lib/types';
import { Button, Divider, InfoBox, SectionCard, Select } from '../ui';

function CountryPhotoSection() {
  const r = useActiveResume();
  const setCountry = useBuilder((s) => s.setCountry);
  const updateSettings = useBuilder((s) => s.updateSettings);
  const country = getCountry(r.settings.country);
  const tone = country.photo === 'expected' ? 'good' : country.photo === 'discouraged' ? 'warn' : 'info';

  const onPhotoFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      updateSettings({ photoDataUrl: String(reader.result), showPhoto: true, photoOverridden: true });
    reader.readAsDataURL(file);
  };

  return (
    <SectionCard className="space-y-3">
      <Select
        label="Target country / region"
        hint="Drives photo recommendation and default page size. (See RESEARCH.md §3 for sources.)"
        value={r.settings.country}
        onChange={(v) => setCountry(v)}
        options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} - photo ${c.photo}` }))}
      />
      <InfoBox tone={tone}>
        <b>{country.name}: photo {country.photo}.</b> {PHOTO_GUIDANCE[country.photo]}
      </InfoBox>
      <div className="flex items-start justify-between gap-3 rounded-md border border-slate-200 p-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Include photo</p>
          <p className="mt-0.5 text-xs leading-snug text-slate-500">
            {r.settings.showPhoto
              ? 'Rendered small, top-right. It never breaks text flow or parse order.'
              : 'Your resume renders without a photo.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={r.settings.showPhoto}
          onClick={() => updateSettings({ showPhoto: !r.settings.showPhoto, photoOverridden: true })}
          className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${r.settings.showPhoto ? 'bg-slate-800' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${r.settings.showPhoto ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>
      {r.settings.showPhoto && (
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          {r.settings.photoDataUrl ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.settings.photoDataUrl} alt="Resume headshot" className="h-16 w-16 rounded-full object-cover" />
              <div className="space-x-2">
                <label className="cursor-pointer text-sm font-medium text-slate-700 underline">
                  Replace
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhotoFile(e.target.files?.[0] ?? null)} />
                </label>
                <button type="button" className="text-sm text-red-600 underline" onClick={() => updateSettings({ photoDataUrl: null })}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 hover:border-slate-400">
              Upload a professional headshot (JPG/PNG)
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhotoFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
          <InfoBox tone="warn">
            Trade-off: photos are ignored by ATS text extraction (no keyword value) and carry unconscious-bias
            risk in discouraged markets. Only use one where it is the local convention.
          </InfoBox>
        </div>
      )}
    </SectionCard>
  );
}

function LayoutSection() {
  const r = useActiveResume();
  const updateSettings = useBuilder((s) => s.updateSettings);
  return (
    <SectionCard className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Layout</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ layout: 'single' })}
          className={`rounded-md border p-3 text-left ${r.settings.layout === 'single' ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-200 hover:border-slate-400'}`}
        >
          <div className="mx-auto mb-2 h-14 w-10 space-y-1 border border-slate-300 p-1">
            <div className="h-1 bg-slate-400" />
            <div className="h-1 bg-slate-300" />
            <div className="h-1 bg-slate-300" />
            <div className="h-1 bg-slate-300" />
          </div>
          <p className="text-xs font-semibold">Single column <span className="ml-1 rounded bg-emerald-100 px-1 py-0.5 text-[10px] text-emerald-800">Recommended</span></p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">Zero-risk on every ATS; fastest recruiter scan.</p>
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ layout: 'hybrid' })}
          className={`rounded-md border p-3 text-left ${r.settings.layout === 'hybrid' ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-200 hover:border-slate-400'}`}
        >
          <div className="mx-auto mb-2 flex h-14 w-10 gap-0.5 border border-slate-300 p-1">
            <div className="flex-1 space-y-1">
              <div className="h-1 bg-slate-400" />
              <div className="h-1 bg-slate-300" />
              <div className="h-1 bg-slate-300" />
            </div>
            <div className="w-2.5 space-y-1">
              <div className="h-1 bg-slate-300" />
              <div className="h-1 bg-slate-300" />
            </div>
          </div>
          <p className="text-xs font-semibold">Safe hybrid <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800">Modern ATS</span></p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">Slim skills sidebar. OK on Greenhouse/Lever/Ashby; risky on Taleo/iCIMS.</p>
        </button>
      </div>
    </SectionCard>
  );
}

function TypographySection() {
  const r = useActiveResume();
  const updateSettings = useBuilder((s) => s.updateSettings);
  const pages = estimatePages(r);
  const safeApplied = r.settings.fontSize === 10 && r.settings.margin === 0.5;
  const fitToOnePage = () => {
    const safeSettings = { fontSize: 10, margin: 0.5 };
    const safeResume = { ...r, settings: { ...r.settings, ...safeSettings } };
    const hybridResume = { ...safeResume, settings: { ...safeResume.settings, layout: 'hybrid' as const } };
    const useHybrid = r.settings.layout === 'single' && estimatePages(safeResume) > 1 && estimatePages(hybridResume) < estimatePages(safeResume);
    updateSettings({ ...safeSettings, ...(useHybrid ? { layout: 'hybrid' as const } : {}) });
  };
  return (
    <SectionCard className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Typography & page</p>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Fit to one page</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              Uses 10pt text and 0.5in margins without deleting content.
            </p>
          </div>
          <Button variant="secondary" size="xs" onClick={fitToOnePage} disabled={safeApplied && (r.settings.layout === 'hybrid' || pages <= 1)}>
            {safeApplied && (r.settings.layout === 'hybrid' || pages <= 1) ? 'Applied' : safeApplied ? 'Try hybrid' : 'Fit'}
          </Button>
        </div>
        {pages > 1 && (
          <p className="mt-2 text-[11px] leading-snug text-amber-700">
            Still estimated at {pages} pages. Shorten or remove lower-priority content rather than shrinking below ATS-safe limits.
          </p>
        )}
      </div>
      <Select
        label="Font (ATS-safe set only)"
        value={r.settings.fontFamily}
        onChange={(v) => updateSettings({ fontFamily: v as FontFamilyOption })}
        options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Body size: {r.settings.fontSize}pt
          </span>
          <input
            type="range"
            min={10}
            max={12}
            step={0.5}
            value={r.settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })}
            className="w-full"
          />
          <span className="text-[11px] text-slate-400">Constrained to the safe 10-12pt range.</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Margins: {r.settings.margin} in
          </span>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.05}
            value={r.settings.margin}
            onChange={(e) => updateSettings({ margin: parseFloat(e.target.value) })}
            className="w-full"
          />
          <span className="text-[11px] text-slate-400">Constrained to 0.5-1 inch.</span>
        </label>
      </div>
      <Select
        label="Page size"
        value={r.settings.pageSize}
        onChange={(v) => updateSettings({ pageSize: v as 'A4' | 'Letter' })}
        options={[
          { value: 'A4', label: 'A4 (most of the world)' },
          { value: 'Letter', label: 'US Letter (US, Canada)' },
        ]}
      />
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Accent color</span>
        <div className="flex gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => updateSettings({ accent: c.value })}
              style={{ backgroundColor: c.value }}
              className={`h-7 w-7 rounded-full transition-transform ${r.settings.accent === c.value ? 'ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-110'}`}
            />
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Used only for your name, headings and rules - body text stays black. Never hurts parsing.
        </p>
      </div>
    </SectionCard>
  );
}

function SectionOrderSection() {
  const r = useActiveResume();
  const updateSettings = useBuilder((s) => s.updateSettings);

  const move = (id: SectionId, dir: -1 | 1) => {
    const order = [...r.settings.sectionOrder];
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    updateSettings({ sectionOrder: order });
  };

  const toggleHidden = (id: SectionId) => {
    const hidden = r.settings.hiddenSections.includes(id)
      ? r.settings.hiddenSections.filter((h) => h !== id)
      : [...r.settings.hiddenSections, id];
    updateSettings({ hiddenSections: hidden });
  };

  return (
    <SectionCard className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section order & visibility</p>
      <p className="text-[11px] text-slate-400">
        Summary, Skills and Experience belong at the top - that is where recruiters look first.
      </p>
      <ul className="divide-y divide-slate-100">
        {r.settings.sectionOrder.map((id, i) => (
          <li key={id} className="flex items-center gap-2 py-1.5">
            <span className="w-5 text-center text-xs text-slate-400">{i + 1}</span>
            <span className={`grow text-sm ${r.settings.hiddenSections.includes(id) ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {SECTION_LABELS[id]}
            </span>
            <Button variant="ghost" size="xs" title="Move up" onClick={() => move(id, -1)} disabled={i === 0}>↑</Button>
            <Button variant="ghost" size="xs" title="Move down" onClick={() => move(id, 1)} disabled={i === r.settings.sectionOrder.length - 1}>↓</Button>
            <Button variant="ghost" size="xs" onClick={() => toggleHidden(id)}>
              {r.settings.hiddenSections.includes(id) ? 'Show' : 'Hide'}
            </Button>
          </li>
        ))}
      </ul>
      <Divider />
      <p className="text-[11px] leading-snug text-slate-400">
        Headings are fixed to the ATS-standard set on purpose - creative headings break ATS field mapping.
      </p>
    </SectionCard>
  );
}

export function DesignPanel() {
  return (
    <div className="space-y-4">
      <CountryPhotoSection />
      <LayoutSection />
      <TypographySection />
      <SectionOrderSection />
    </div>
  );
}
