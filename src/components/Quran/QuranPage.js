import React, { useEffect, useMemo, useRef } from "react";
import colors from "tailwindcss/colors";
import { ReadingView } from "react-quran";

function QuranPage({ page, fixedAspectRatio = true }) {
  const rootRef = useRef(null);

  const colorName = window.api.getColor?.() || "blue";
  const theme = window.api.getSettings?.().theme || "dark";

  const readingViewStyles = useMemo(
    () => ({
      width: "500px",
      backgroundColor: "transparent",
      color: theme === "light" ? "black" : "white",
      margin: "0",
      paddingTop: "12px",
      paddingBottom: "12px",
      paddingLeft: "28px",
      paddingRight: "28px",
    }),
    [theme]
  );

  useEffect(() => {
    if (!page) return;
    const el = rootRef.current;
    if (!el) return;

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const targetColor = colors[colorName]?.[500];

    // Set CSS variable for hover color
    el.style.setProperty("--ayah-hover-color", targetColor);

    // Add hover effect to highlight all words in the same verse
    const setupVerseHover = () => {
      const verseSpans = el.querySelectorAll("span[data-verse]");
      const cleanupFunctions = [];
      
      verseSpans.forEach((span) => {
        const handleMouseEnter = () => {
          const verseNumber = span.getAttribute("data-verse");
          if (!verseNumber) return;
          
          // Find all spans with the same data-verse value in the entire document
          const allVerseSpans = document.querySelectorAll(`span[data-verse="${verseNumber}"]`);
          allVerseSpans.forEach((s) => {
            s.classList.add("ayah-hovered");
          });
        };

        const handleMouseLeave = () => {
          const verseNumber = span.getAttribute("data-verse");
          if (!verseNumber) return;
          
          // Remove highlight from all spans with the same data-verse value
          const allVerseSpans = document.querySelectorAll(`span[data-verse="${verseNumber}"]`);
          allVerseSpans.forEach((s) => {
            s.classList.remove("ayah-hovered");
          });
        };

        span.addEventListener("mouseenter", handleMouseEnter);
        span.addEventListener("mouseleave", handleMouseLeave);
        
        cleanupFunctions.push(() => {
          span.removeEventListener("mouseenter", handleMouseEnter);
          span.removeEventListener("mouseleave", handleMouseLeave);
        });
      });

      // Return cleanup function
      return () => {
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    };

    let cleanupHover = null;

    const run = () => {
      const spans = el.querySelectorAll("span");
      for (let i = 0; i < spans.length; i++) {
        const s = spans[i];
        const txt = s.textContent || "";
        for (let j = 0; j < arabicNumbers.length; j++) {
          if (txt.includes(arabicNumbers[j])) {
            s.style.color = targetColor;
            break;
          }
        }
      }
      
      // Setup verse hover after DOM is ready
      cleanupHover = setupVerseHover();
    };

    const ric = window.requestIdleCallback;
    
    if (typeof ric === "function") {
      const id = ric(run, { timeout: 250 });
      return () => {
        window.cancelIdleCallback?.(id);
        if (cleanupHover) cleanupHover();
      };
    } else {
      const id = setTimeout(run, 0);
      return () => {
        clearTimeout(id);
        if (cleanupHover) cleanupHover();
      };
    }
  }, [page, colorName]);

  if (!page) return null;

  return (
    <div className="w-full relative" dir="rtl">
      <div
        ref={rootRef}
        className={`quran-text ${page % 2 === 0 ? "border-l-4" : "border-r-4"} border-bg-color-3`}
      >
        <ReadingView
          page={page}
          readingViewStyles={readingViewStyles}
          surahTitleStyles={{
            border: "none",
            fontFamily: "Naskh",
            // padding top bottom 12px
            margin: "24px auto",
          }}
          fixedAspectRatio={fixedAspectRatio}
        />
        <span className="text-xs text-text-2">{page}</span>
      </div>
    </div>
  );
}

export default React.memo(QuranPage);
