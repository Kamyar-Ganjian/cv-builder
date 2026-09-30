'use client';

import React from 'react';

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1 block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</span>
      {hint && <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">{hint}</span>}
    </span>
  );
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      {label && <Label hint={hint}>{label}</Label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
      />
    </label>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      {label && <Label hint={hint}>{label}</Label>}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm leading-relaxed text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
      />
    </label>
  );
}

export function Select<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label?: string;
  hint?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="block">
      {label && <Label hint={hint}>{label}</Label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'sm',
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  title?: string;
}) {
  const base = 'inline-flex items-center justify-center gap-1 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';
  const sizes = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' };
  const variants = {
    primary: 'bg-slate-800 text-white hover:bg-slate-700',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    danger: 'text-red-600 hover:bg-red-50',
  };
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </button>
  );
}

export function InfoBox({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'good'; children: React.ReactNode }) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  return <div className={`rounded-md border px-3 py-2 text-xs leading-relaxed ${tones[tone]}`}>{children}</div>;
}

export function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm ${className}`}>{children}</div>;
}

export function Divider() {
  return <hr className="my-3 border-slate-200" />;
}
