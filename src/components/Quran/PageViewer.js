import { useRef, useEffect, useLayoutEffect } from "react";
import QuranPage from "./QuranPage";

function PageViewer({
  allPagesInSurah,
  scale,
  currentPage,
  selectedSurah,
  surahRange,
  onPageClick,
  pageViewerRef,
  onPageChange,
  tafsirOpen = false,
}) {
  const isScrollingRef = useRef(false);

  const hardResetScrollTop = () => {
    const container = pageViewerRef.current;
    if (!container) return;
    isScrollingRef.current = true;
    requestAnimationFrame(() => {
      container.scrollTop = 0;
      requestAnimationFrame(() => {
        isScrollingRef.current = false;
      });
    });
  };

  useLayoutEffect(() => {
    if (!selectedSurah) return;
    // Defer scroll reset to avoid blocking
    requestAnimationFrame(() => {
      hardResetScrollTop();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurah]);

  useEffect(() => {
    const container = pageViewerRef.current;
    if (!container || !selectedSurah) return;

    let rafId = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          let best = null;
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
          }
          if (!best) return;

          const pageNum = Number(best.target.getAttribute("data-page"));
          if (!pageNum) return;

          if (pageNum !== currentPage) onPageChange(pageNum);
        });
      },
      { root: container, threshold: [0.2, 0.35, 0.5, 0.65, 0.8] }
    );

    const nodes = container.querySelectorAll("[data-page]");
    nodes.forEach((n) => observer.observe(n));

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selectedSurah, scale, currentPage, onPageChange, pageViewerRef]);

  const progress =
    !selectedSurah || surahRange.end === surahRange.start
      ? 0
      : Math.round(
          ((currentPage - surahRange.start + 1) / (surahRange.end - surahRange.start + 1)) * 100
        );

  const color = window.api.getColor?.() || "blue";

  return (
    <div
      ref={pageViewerRef}
      className="overflow-y-auto min-h-0 relative flex flex-1"
      onClick={onPageClick}
    >
      <div className="sticky top-0 self-start w-1 h-full z-10 mr-2">
        <div className="w-full h-full bg-bg-color-2 rounded-full overflow-hidden">
          <div
            className={`w-full bg-${color}-500 transition-all duration-300`}
            style={{ height: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`flex-1 w-full flex justify-center ${currentPage === 1 ? "items-center" : ""}`}>
        <div className="px-4" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          {allPagesInSurah.map((pageNum) => (
            <div key={pageNum} data-page={pageNum} className="mb-4">
              <QuranPage page={pageNum} fixedAspectRatio={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PageViewer;

