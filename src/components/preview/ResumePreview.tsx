'use client';

import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { estimatePages } from '../../lib/analysis/estimate';
import { useActiveResume } from '../../lib/store';
import type { Resume } from '../../lib/types';

type ViewerProps = {
  children?: ReactNode;
  showToolbar?: boolean;
  style?: CSSProperties;
};

type ViewerComponent = ComponentType<ViewerProps>;
type DocumentComponent = ComponentType<{ resume: Resume }>;

export function ResumePreview() {
  const r = useActiveResume();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [PDFViewer, setPDFViewer] = useState<ViewerComponent | null>(null);
  const [PdfDocument, setPdfDocument] = useState<DocumentComponent | null>(null);

  const MM = 96 / 25.4;
  const pageW = r.settings.pageSize === 'A4' ? 210 : 215.9;
  const pageH = r.settings.pageSize === 'A4' ? 297 : 279.4;
  const pages = estimatePages(r);

  useEffect(() => {
    let active = true;
    Promise.all([import('@react-pdf/renderer'), import('../../lib/export/PdfDocument')]).then(([renderer, documentModule]) => {
      if (!active) return;
      setPDFViewer(() => renderer.PDFViewer as unknown as ViewerComponent);
      setPdfDocument(() => documentModule.PdfDocument);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / (pageW * MM)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [MM, pageW]);

  const Viewer = PDFViewer;
  const Document = PdfDocument;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded bg-slate-200 shadow-2xl ring-1 ring-slate-300"
        style={{ height: pageH * MM * scale }}
      >
        {Viewer && Document ? (
          <Viewer showToolbar={false} style={{ width: '100%', height: '100%', border: 'none' }}>
            <Document resume={r} />
          </Viewer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading PDF preview...</div>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Estimated length: ~{pages} page{pages === 1 ? '' : 's'}. PDF preview uses the same renderer as export.
      </p>
    </div>
  );
}
