"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

const PDF_URL = "/docs/winshell-report.pdf";

if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

type PageMeta = {
  width: number;
  height: number;
};

type DocumentLoadSuccessHandler = NonNullable<ComponentProps<typeof Document>["onLoadSuccess"]>;
type DocumentLoadSuccessParam = Parameters<DocumentLoadSuccessHandler>[0];

export function PdfScrollViewer() {
  const viewerRef = useRef<HTMLDivElement>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageMeta, setPageMeta] = useState<PageMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [thumbnailsVisible, setThumbnailsVisible] = useState(false);
  const [viewerWidth, setViewerWidth] = useState(960);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewerWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const documentOptions = useMemo(
    () => ({
      cMapUrl: "/cmaps/",
      standardFontDataUrl: "/standard_fonts/",
    }),
    []
  );

  const basePageWidth = useMemo(() => {
    const maxWidth = Math.min(viewerWidth - 48, 1024);
    return Math.max(maxWidth, 320);
  }, [viewerWidth]);

  const estimatePageSize = useCallback(
    (index: number) => {
      const meta = pageMeta[index] ?? { width: 612, height: 792 };
      const width = Math.min(basePageWidth, meta.width) * scale;
      const height = (meta.height / meta.width) * width;
      return height + 72; // include padding & caption
    },
    [basePageWidth, pageMeta, scale]
  );

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: numPages,
    getScrollElement: () => viewerRef.current,
    estimateSize: estimatePageSize,
    overscan: 2,
    enabled: numPages > 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, estimatePageSize, numPages]);

  useEffect(() => {
    if (virtualItems.length === 0) return;

    const firstVisible = virtualItems[0];
    if (!firstVisible) return;

    const nextPage = firstVisible.index + 1;
    setCurrentPage((prev) => (prev === nextPage ? prev : nextPage));
  }, [virtualItems]);

  const handleDocumentLoadSuccess = useCallback<DocumentLoadSuccessHandler>((doc) => {
    const documentProxy = doc as DocumentLoadSuccessParam;
    setNumPages(documentProxy.numPages);
    setError(null);

    (async () => {
      try {
        const dimensions: PageMeta[] = [];
        for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
          const page = await documentProxy.getPage(pageNumber);
          const [, , width, height] = page.view;
          dimensions.push({ width, height });
        }
        setPageMeta(dimensions);
      } catch (metadataError) {
        console.warn("Failed to read page metadata", metadataError);
        setPageMeta(new Array(documentProxy.numPages).fill({ width: 612, height: 792 }));
      }
    })();
  }, []);

  const renderPage = useCallback(
    (index: number) => {
      const meta = pageMeta[index] ?? { width: 612, height: 792 };
      const width = Math.min(basePageWidth, meta.width) * scale;

      return (
        <div className="px-4 pb-6">
          <article className="flex flex-col items-center gap-4 rounded-3xl bg-slate-900/60 p-6 shadow-[0_0_45px_rgba(15,23,42,0.4)] ring-1 ring-white/5">
            <Page
              pageNumber={index + 1}
              width={width}
              renderAnnotationLayer
              renderTextLayer
            />
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Page {index + 1}</p>
          </article>
        </div>
      );
    },
    [basePageWidth, pageMeta, scale]
  );

  const handleZoomChange = useCallback((value: number) => {
    setScale(value);
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = PDF_URL;
    link.download = "winshell-report.pdf";
    link.rel = "noopener";
    link.click();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const scrollToPage = useCallback(
    (pageNumber: number) => {
      virtualizer.scrollToIndex(pageNumber - 1, { align: "start" });
    },
    [virtualizer]
  );

  return (
    <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Project Report</h2>
        <p className="mt-3 text-sm uppercase tracking-[0.35em] text-slate-300">Explore the full documentation</p>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_40px_rgba(15,23,42,0.6)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
          <button
            type="button"
            onClick={() => setThumbnailsVisible((prev) => !prev)}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold uppercase tracking-[0.3em] text-slate-100 transition hover:border-white/30 hover:bg-white/15"
          >
            ☰ Pages
          </button>

          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 min-w-[200px]">
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">Search</span>
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find in document"
              className="flex-1 bg-transparent text-xs tracking-[0.3em] text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2">
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">Zoom</span>
            <input
              type="range"
              min={60}
              max={200}
              value={Math.round(scale * 100)}
              onChange={(event) => handleZoomChange(Number(event.target.value) / 100)}
            />
            <span className="text-xs font-semibold tracking-[0.3em] text-slate-200">{Math.round(scale * 100)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100 transition hover:border-white/30 hover:bg-white/15"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-500/30"
            >
              ⬇ Download
            </button>
          </div>
        </div>

        <div className="mt-6 flex h-[70vh] gap-4 sm:h-[75vh]">
          {thumbnailsVisible && numPages > 0 && (
            <aside className="hidden w-40 flex-shrink-0 flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/70 p-3 sm:flex">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">Pages</p>
              <div className="mt-2 flex flex-col gap-2">
                {Array.from({ length: numPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === currentPage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => scrollToPage(pageNumber)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                        isActive
                          ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      <span>Page {pageNumber}</span>
                      <span className="text-[0.6rem] text-slate-400">Jump</span>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
            <div ref={viewerRef} className="h-full w-full overflow-auto">
              {error ? (
                <ErrorState message={error} />
              ) : (
                <Document
                  file={PDF_URL}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={(loadError) => {
                    console.warn("PDF Load Error", loadError);
                    setError(loadError?.message || "Unable to load the report.");
                  }}
                  loading={<LoadingState />}
                  options={documentOptions}
                >
                  {numPages > 0 ? (
                    <div
                      className="relative w-full"
                      style={{ height: virtualizer.getTotalSize(), minHeight: "100%" }}
                    >
                      {virtualItems.map((virtualItem) => (
                        <div
                          key={virtualItem.key}
                          ref={virtualizer.measureElement}
                          className="absolute left-0 top-0 w-full"
                          style={{ transform: `translateY(${virtualItem.start}px)` }}
                        >
                          {renderPage(virtualItem.index)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <LoadingState />
                  )}
                </Document>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.35em] text-slate-400">
      Preparing document…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 px-6 text-center text-sm font-medium text-red-200">
      {message}
    </div>
  );
}
