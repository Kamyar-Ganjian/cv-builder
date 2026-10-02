'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEmptyResume, defaultSettings, uid } from './defaults';
import { createSampleResume } from './sample';
import { getCountry } from './countries';
import type { Resume, ResumeSettings } from './types';

interface BuilderState {
  resumes: Record<string, Resume>;
  activeId: string;
  // lifecycle
  createResume: (name?: string) => void;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  setActive: (id: string) => void;
  renameResume: (id: string, name: string) => void;
  // content mutation
  updateActive: (updater: (r: Resume) => Resume) => void;
  updateSettings: (patch: Partial<ResumeSettings>) => void;
  setCountry: (code: string) => void;
  // import / export
  exportActiveJson: () => string;
  importJson: (json: string) => { ok: boolean; error?: string };
  resetAll: () => void;
}

function withUpdated(r: Resume): Resume {
  return { ...r, updatedAt: Date.now() };
}

function firstResume(): { resumes: Record<string, Resume>; activeId: string } {
  const sample = createSampleResume();
  return { resumes: { [sample.id]: sample }, activeId: sample.id };
}

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      ...firstResume(),

      createResume: (name) => {
        const r = createEmptyResume(name?.trim() || `Resume ${Object.keys(get().resumes).length + 1}`);
        set((s) => ({ resumes: { ...s.resumes, [r.id]: r }, activeId: r.id }));
      },

      duplicateResume: (id) => {
        const src = get().resumes[id];
        if (!src) return;
        const copy: Resume = {
          ...JSON.parse(JSON.stringify(src)),
          id: uid(),
          name: `${src.name} (copy)`,
          updatedAt: Date.now(),
        };
        set((s) => ({ resumes: { ...s.resumes, [copy.id]: copy }, activeId: copy.id }));
      },

      deleteResume: (id) => {
        const { resumes, activeId } = get();
        const rest = { ...resumes };
        delete rest[id];
        if (Object.keys(rest).length === 0) {
          const fresh = createEmptyResume('My Resume');
          set({ resumes: { [fresh.id]: fresh }, activeId: fresh.id });
          return;
        }
        set({
          resumes: rest,
          activeId: activeId === id ? Object.keys(rest)[0] : activeId,
        });
      },

      setActive: (id) => set({ activeId: id }),

      renameResume: (id, name) =>
        set((s) =>
          s.resumes[id]
            ? { resumes: { ...s.resumes, [id]: { ...s.resumes[id], name, updatedAt: Date.now() } } }
            : {}
        ),

      updateActive: (updater) =>
        set((s) => {
          const cur = s.resumes[s.activeId];
          if (!cur) return {};
          return { resumes: { ...s.resumes, [s.activeId]: withUpdated(updater(cur)) } };
        }),

      updateSettings: (patch) =>
        get().updateActive((r) => ({ ...r, settings: { ...r.settings, ...patch } })),

      setCountry: (code) =>
        get().updateActive((r) => {
          const country = getCountry(code);
          return {
            ...r,
            settings: {
              ...r.settings,
              country: code,
              pageSize: country.pageSize,
              // Only auto-flip the photo if the user hasn't made an explicit choice.
              showPhoto: r.settings.photoOverridden ? r.settings.showPhoto : country.photo === 'expected',
            },
          };
        }),

      exportActiveJson: () => JSON.stringify(get().resumes[get().activeId], null, 2),

      importJson: (json) => {
        try {
          const data = JSON.parse(json) as Resume;
          if (!data || typeof data !== 'object' || !data.contact || !data.settings) {
            return { ok: false, error: 'Not a valid resume file.' };
          }
          const defaults = createEmptyResume(data.name || 'Imported Resume');
          const migrated: Resume = {
            ...defaults,
            ...data,
            contact: { ...defaults.contact, ...data.contact },
            settings: { ...defaultSettings(data.settings.country), ...data.settings },
            education: (data.education ?? defaults.education).map((item) => ({ ...item, current: item.current ?? false })),
            id: uid(),
            updatedAt: Date.now(),
          };
          set((s) => ({ resumes: { ...s.resumes, [migrated.id]: migrated }, activeId: migrated.id }));
          return { ok: true };
        } catch {
          return { ok: false, error: 'Could not parse JSON.' };
        }
      },

      resetAll: () => set(firstResume()),
    }),
    {
      name: 'cv-builder-v1',
      version: 5,
      migrate: (persistedState, version) => {
        let state = persistedState as Partial<BuilderState>;
        if (version < 3) {
          const resumes = Object.fromEntries(
            Object.entries(state.resumes ?? {}).map(([id, resume]) => [
              id,
              {
                ...resume,
                contact: {
                  ...resume.contact,
                  github: resume.contact.github ?? '',
                  linkedinText: resume.contact.linkedinText ?? '',
                  githubText: resume.contact.githubText ?? '',
                  websiteText: resume.contact.websiteText ?? '',
                },
              },
            ])
          );
          state = { ...state, resumes };
        }
        if (version < 4) {
          const resumes = Object.fromEntries(
            Object.entries(state.resumes ?? {}).map(([id, resume]) => [
              id,
              {
                ...resume,
                education: (resume.education ?? []).map((item) => ({ ...item, current: item.current ?? false })),
              },
            ])
          );
          state = { ...state, resumes };
        }
        return state as BuilderState;
      },
    }
  )
);

/** Convenience selector for the active resume (stable reference). */
export function useActiveResume(): Resume {
  return useBuilder((s) => s.resumes[s.activeId]);
}
