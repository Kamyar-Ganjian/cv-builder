"use client";

import { useRef, useState } from "react";
import { useBuilder } from "../lib/store";
import { Button } from "./ui";

export function ResumeManager() {
  const resumes = useBuilder((s) => s.resumes);
  const activeId = useBuilder((s) => s.activeId);
  const {
    createResume,
    duplicateResume,
    deleteResume,
    setActive,
    renameResume,
    exportActiveJson,
    importJson,
  } = useBuilder();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = resumes[activeId];
  const list = Object.values(resumes).sort((a, b) => b.updatedAt - a.updatedAt);

  const downloadJson = () => {
    const blob = new Blob([exportActiveJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(active?.name || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const onImportFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importJson(String(reader.result));
      setError(res.ok ? null : (res.error ?? "Import failed."));
      if (res.ok) setOpen(false);
    };
    reader.readAsText(f);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-56 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        <span className="truncate">{active?.name ?? "Resume"}</span>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Your resumes (tailor one per job)
          </p>
          <ul className="max-h-56 overflow-auto">
            {list.map((r) => (
              <li
                key={r.id}
                className={`group flex items-center gap-1 rounded px-2 py-1 ${r.id === activeId ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <button
                  type="button"
                  className="grow truncate text-left text-sm text-slate-800"
                  onClick={() => {
                    setActive(r.id);
                    setOpen(false);
                  }}
                >
                  {r.name}
                </button>
                <button
                  type="button"
                  title="Duplicate (start a tailored version)"
                  className="rounded px-1 text-xs text-slate-400 hover:text-slate-700"
                  onClick={() => duplicateResume(r.id)}
                >
                  ⧉
                </button>
                <button
                  type="button"
                  title="Delete"
                  className="rounded px-1 text-xs text-slate-400 hover:text-red-600"
                  onClick={() => deleteResume(r.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                createResume();
              }}
            >
              + New
            </Button>
            <Button variant="secondary" size="xs" onClick={downloadJson}>
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {error && (
            <p className="mt-1 px-2 text-[11px] text-red-600">{error}</p>
          )}
          <div className="mt-2 border-t border-slate-100 px-2 pt-2">
            <label className="block text-[11px] text-slate-500">
              Rename current:
              <input
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
                value={active?.name ?? ""}
                onChange={(e) => renameResume(activeId, e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
