import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import QuranPage from "./QuranPage";
import colors from "tailwindcss/colors";
import {
  IconMaximize,
  IconMinimize,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

// Maps 0-100 speed value to px/frame — 0 means stopped
function speedToPxPerFrame(speed) {
  if (speed <= 0) return 0;
  return speed * 0.015;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// ---------------------------------------------------------------------------
// Pure UI bar — full-height variant (maximize mode)
// speed and onSpeedChange come from PageViewer (lifted state)
// ---------------------------------------------------------------------------
function AutoScrollBarFull({ speed, onSpeedChange, accentColor }) {
  const barRef = useRef(null);
  const isDraggingRef = useRef(false);

  const getSpeed = useCallback((clientY) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const raw = (clientY - rect.top) / rect.height;
    return Math.round(clamp(raw, 0, 1) * 100);
  }, []);

  const onDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    barRef.current?.setPointerCapture?.(e.pointerId);
    onSpeedChange(getSpeed(e.clientY));
  }, [getSpeed, onSpeedChange]);

  const onMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    onSpeedChange(getSpeed(e.clientY));
  }, [getSpeed, onSpeedChange]);

  const onUp = useCallback(() => { isDraggingRef.current = false; }, []);

  return (
    <div
      ref={barRef}
      title="Auto-scroll speed — drag to set"
      className="w-full h-full rounded-full overflow-hidden cursor-pointer relative select-none"
      style={{ background: "var(--bg-color-2)" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div
        className="absolute left-0 right-0 rounded-full"
        style={{
          top: 0,
          height: `${speed}%`,
          background: accentColor,
          opacity: speed > 0 ? 0.8 : 0.25,
          transition: isDraggingRef.current ? "none" : "opacity 0.3s",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow border border-bg-color"
        style={{
          top: `calc(${speed}% - 6px)`,
          background: speed > 0 ? accentColor : "var(--bg-color-3)",
          transition: isDraggingRef.current ? "none" : "top 0.05s, background 0.3s",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pure UI bar — compact variant (normal mode, 120px height)
// ---------------------------------------------------------------------------
function AutoScrollBarCompact({ speed, onSpeedChange, accentColor }) {
  const barRef = useRef(null);
  const isDraggingRef = useRef(false);

  const getSpeed = useCallback((clientY) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const raw = (clientY - rect.top) / rect.height;
    return Math.round(clamp(raw, 0, 1) * 100);
  }, []);

  const onDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    barRef.current?.setPointerCapture?.(e.pointerId);
    onSpeedChange(getSpeed(e.clientY));
  }, [getSpeed, onSpeedChange]);

  const onMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    onSpeedChange(getSpeed(e.clientY));
  }, [getSpeed, onSpeedChange]);

  const onUp = useCallback(() => { isDraggingRef.current = false; }, []);

  return (
    <div
      ref={barRef}
      title="Auto-scroll speed"
      className="relative rounded-full overflow-hidden cursor-pointer select-none"
      style={{ width: "4px", height: "120px", background: "var(--bg-color-2)" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div
        className="absolute left-0 right-0 rounded-full"
        style={{
          top: 0,
          height: `${speed}%`,
          background: accentColor,
          opacity: speed > 0 ? 0.8 : 0.25,
          transition: isDraggingRef.current ? "none" : "opacity 0.3s",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full shadow border border-bg-color"
        style={{
          width: "10px",
          height: "10px",
          top: `calc(${speed}% - 5px)`,
          background: speed > 0 ? accentColor : "var(--bg-color-3)",
          transition: isDraggingRef.current ? "none" : "top 0.05s, background 0.3s",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageViewer — owns scroll speed state & RAF loop
// ---------------------------------------------------------------------------
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
  isMaximized = false,
  onToggleMaximize,
  onScaleChange,
}) {
  const isScrollingRef = useRef(false);
  const colorName = window.api.getColor?.() || "blue";
  const accentColor = colors[colorName]?.[500] || "#3b82f6";

  // ── Autoscroll state lifted here so it survives maximize toggles ──
  const [autoSpeed, setAutoSpeed] = useState(0);
  const autoSpeedRef = useRef(0);
  const scrollAccumRef = useRef(0);

  useEffect(() => { autoSpeedRef.current = autoSpeed; }, [autoSpeed]);

  // Single RAF loop — always running, unaffected by maximize toggle
  useEffect(() => {
    let rafId;
    const tick = () => {
      const container = pageViewerRef.current;
      if (container && autoSpeedRef.current > 0) {
        scrollAccumRef.current += speedToPxPerFrame(autoSpeedRef.current);
        const whole = Math.floor(scrollAccumRef.current);
        if (whole >= 1) {
          container.scrollTop += whole;
          scrollAccumRef.current -= whole;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [pageViewerRef]);

  const hardResetScrollTop = () => {
    const container = pageViewerRef.current;
    if (!container) return;
    isScrollingRef.current = true;
    requestAnimationFrame(() => {
      container.scrollTop = 0;
      requestAnimationFrame(() => { isScrollingRef.current = false; });
    });
  };

  useLayoutEffect(() => {
    if (!selectedSurah) return;
    requestAnimationFrame(() => { hardResetScrollTop(); });
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
    return () => { observer.disconnect(); if (rafId) cancelAnimationFrame(rafId); };
  }, [selectedSurah, scale, currentPage, onPageChange, pageViewerRef]);

  const progress =
    !selectedSurah || surahRange.end === surahRange.start
      ? 0
      : Math.round(
          ((currentPage - surahRange.start + 1) / (surahRange.end - surahRange.start + 1)) * 100
        );

  const iconBtn =
    "p-1.5 rounded hover:bg-bg-color-2 text-text-2 hover:text-text transition-colors cursor-pointer flex items-center justify-center";

  return (
    <div
      ref={pageViewerRef}
      className="overflow-y-auto min-h-0 relative flex flex-1"
      onClick={onPageClick}
    >
      {/* ── Left: reading progress bar ── */}
      <div className="sticky top-0 self-start w-1 h-full z-10 ml-2 mr-1 flex-shrink-0">
        <div className="w-full h-full bg-bg-color-2 rounded-full overflow-hidden">
          <div
            className="w-full rounded-full transition-all duration-300"
            style={{ height: `${progress}%`, background: accentColor }}
          />
        </div>
      </div>

      {/* ── Pages ── */}
      <div className={`flex-1 w-full flex justify-center ${currentPage === 1 ? "items-center" : ""}`}>
        <div className="px-4" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          {allPagesInSurah.map((pageNum) => (
            <div key={pageNum} data-page={pageNum} className="mb-4">
              <QuranPage page={pageNum} fixedAspectRatio={false} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      {isMaximized ? (
        /* MAXIMIZE MODE: slim full-height autoscroll bar */
        <div
          className="sticky top-0 self-start w-1 h-full z-10 ml-1 mr-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <AutoScrollBarFull
            speed={autoSpeed}
            onSpeedChange={setAutoSpeed}
            accentColor={accentColor}
          />
        </div>
      ) : (
        /* NORMAL MODE: maximize button + compact autoscroll bar */
        <div
          className="sticky top-4 self-start z-20 mr-3 ml-1 flex flex-col items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button className={iconBtn} title="Focus mode" onClick={onToggleMaximize}>
            <IconMaximize size={16} />
          </button>
          <div className="w-4 h-px bg-bg-color-3 rounded-full my-0.5" />
          <AutoScrollBarCompact
            speed={autoSpeed}
            onSpeedChange={setAutoSpeed}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* ── Floating controls in maximize mode (top-right) ── */}
      {isMaximized && (
        <div
          className="fixed top-3 right-3 z-[70] flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={iconBtn}
            title="Zoom out"
            onClick={() => onScaleChange?.((s) => clamp(Math.round((s - 0.05) * 100) / 100, 0.8, 1.4))}
          >
            <IconZoomOut size={16} />
          </button>
          <button
            className={iconBtn}
            title="Zoom in"
            onClick={() => onScaleChange?.((s) => clamp(Math.round((s + 0.05) * 100) / 100, 0.8, 1.4))}
          >
            <IconZoomIn size={16} />
          </button>
          <button className={iconBtn} title="Exit focus mode (Esc)" onClick={onToggleMaximize}>
            <IconMinimize size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default PageViewer;
