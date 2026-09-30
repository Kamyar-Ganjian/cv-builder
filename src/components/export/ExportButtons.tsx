'use client';

import { useState } from 'react';
import { slugify } from '../../lib/export/shared';
import { useActiveResume } from '../../lib/store';
import { Button } from '../ui';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function ExportButtons() {
  const r = useActiveResume();
  const [busy, setBusy] = useState<'pdf' | 'docx' | null>(null);
  const base = slugify(r.contact.fullName || r.name || 'resume');

  const exportPdf = async () => {
    setBusy('pdf');
    try {
      const [{ pdf }, { PdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../lib/export/PdfDocument'),
      ]);
      const { createElement } = await import('react');
      const element = createElement(PdfDocument, { resume: r }) as unknown as Parameters<typeof pdf>[0];
      const blob = await pdf(element).toBlob();
      download(blob, `${base}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const exportDocx = async () => {
    setBusy('docx');
    try {
      const { buildDocx } = await import('../../lib/export/buildDocx');
      const blob = await buildDocx(r);
      download(blob, `${base}.docx`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" size="sm" onClick={exportPdf} disabled={busy !== null} title="Text-selectable PDF - modern ATS safe">
        {busy === 'pdf' ? 'Building…' : 'PDF'}
      </Button>
      <Button variant="secondary" size="sm" onClick={exportDocx} disabled={busy !== null} title="Word format - safest for legacy ATS (Taleo, iCIMS)">
        {busy === 'docx' ? 'Building…' : 'DOCX'}
      </Button>
    </div>
  );
}
