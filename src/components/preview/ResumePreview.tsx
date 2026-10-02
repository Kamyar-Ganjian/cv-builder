'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { estimatePages } from '../../lib/analysis/estimate';
import { useActiveResume } from '../../lib/store';

type PdfViewport = { width: number; height: number };

type PdfPage = {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => { promise: Promise<void> };
};

type PdfDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  cleanup?: () => Promise<unknown>;
};

function releasePdfDocument(document: PdfDocumentProxy | null) {
  if (document && typeof document.cleanup === 'function') {
    void document.cleanup().catch(() => {});
  }
}

export function ResumePreview() {
  const r = useActiveResume();
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasesRef = useRef<Array<HTMLCanvasElement | null>>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<PdfDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const MM = 96 / 25.4;
  const pageW = r.settings.pageSize === 'A4' ? 210 : 215.9;
  const pageH = r.settings.pageSize === 'A4' ? 297 : 279.4;
  const estimatedPages = estimatePages(r);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadedDocument: PdfDocumentProxy | null = null;
    const timer = window.setTimeout(async () => {
      setPdfDocument(null);
      setPageCount(0);
      try {
        const [{ pdf }, { PdfDocument }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('../../lib/export/PdfDocument'),
        ]);
        const element = createElement(PdfDocument, { resume: r }) as unknown as Parameters<typeof pdf>[0];
        const blob = await pdf(element).toBlob();
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const data = new Uint8Array(await blob.arrayBuffer());
        const loaded = await pdfjs.getDocument({ data }).promise as unknown as PdfDocumentProxy;
        if (cancelled) {
          releasePdfDocument(loaded);
          return;
        }
        loadedDocument = loaded;
        setPdfDocument(loaded);
        setPageCount(loaded.numPages);
      } catch {
        if (!cancelled) {
          setPdfDocument(null);
          setPageCount(0);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      releasePdfDocument(loadedDocument);
    };
  }, [r]);

  useEffect(() => {
    if (!pdfDocument || !containerWidth || pageCount === 0) return;
    let cancelled = false;

    const renderPages = async () => {
      const firstPage = await pdfDocument.getPage(1);
      const baseViewport = firstPage.getViewport({ scale: 1 });
      const scale = containerWidth / baseViewport.width;
      const outputScale = window.devicePixelRatio || 1;

      for (let index = 0; index < pageCount; index += 1) {
        if (cancelled) return;
        const page = index === 0 ? firstPage : await pdfDocument.getPage(index + 1);
        const viewport = page.getViewport({ scale });
        const canvas = canvasesRef.current[index];
        const context = canvas?.getContext('2d');
        if (!canvas || !context) continue;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        await page.render({ canvasContext: context, viewport }).promise;
      }
    };

    void renderPages();
    return () => {
      cancelled = true;
    };
  }, [containerWidth, pageCount, pdfDocument]);

  return (
    <div>
      <div
        ref={previewRef}
        className="w-full bg-white"
        style={{ minHeight: pageH * MM * Math.min(1, containerWidth / (pageW * MM || 1)) }}
      >
        {pageCount > 0 ? (
          <div className="bg-white">
            {Array.from({ length: pageCount }, (_, index) => (
              <div key={index}>
                <canvas
                  ref={(canvas) => {
                    canvasesRef.current[index] = canvas;
                  }}
                  aria-label={`Resume page ${index + 1}`}
                  className="block bg-white"
                />
                {index < pageCount - 1 && <div aria-hidden="true" className="my-4 border-t border-slate-300" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Loading PDF preview...</div>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        {pageCount > 0 ? `PDF length: ${pageCount} page${pageCount === 1 ? '' : 's'}.` : `Estimated length: ~${estimatedPages} page${estimatedPages === 1 ? '' : 's'}.`}{' '}
        Preview uses the same PDF renderer as export.
      </p>
    </div>
  );
}
