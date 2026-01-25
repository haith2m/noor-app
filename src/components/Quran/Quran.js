import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Loading from "../Loading";
import SurahList from "./SurahList";
import PageViewer from "./PageViewer";
import TafsirPanel from "./TafsirPanel";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Quran() {
  const { t, i18n } = useTranslation();

  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [selectedSurah, setSelectedSurah] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [surahRange, setSurahRange] = useState({ start: 1, end: 1 });

  const pageViewerRef = useRef(null);
  const surahIndicatorRef = useRef(null);

  const [scaleBase, setScaleBase] = useState(1);
  const [scaleUser, setScaleUser] = useState(1);
  const scale = useMemo(
    () => clamp(scaleBase * scaleUser, 0.85, 1.6),
    [scaleBase, scaleUser]
  );

  const allPagesInSurah = useMemo(() => {
    if (!selectedSurah) return [];
    const arr = [];
    for (let p = surahRange.start; p <= surahRange.end; p++) arr.push(p);
    return arr;
  }, [selectedSurah, surahRange.start, surahRange.end]);

  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState(null);
  const [tafsirText, setTafsirText] = useState("");
  const [selectedVerse, setSelectedVerse] = useState(null);

  const [tafsirs, setTafsirs] = useState([]);
  const [tafsirId, setTafsirId] = useState(null);

  const tafsirCacheRef = useRef(new Map());

  useEffect(() => {
    const updateScaleBase = () => {
      const container = pageViewerRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const innerPadding = 32;
      const baseContentWidth = 500 + 56;
      const target = (w - innerPadding) / baseContentWidth;
      setScaleBase(clamp(target, 0.9, 1.35));
    };

    updateScaleBase();
    window.addEventListener("resize", updateScaleBase);
    return () => window.removeEventListener("resize", updateScaleBase);
  }, []);

  useEffect(() => {
    const fetchTafsirs = async () => {
      try {
        const res = await fetch(`https://noorapi.vercel.app/api/tafsirs?lang=${i18n.language}`);
        const json = await res.json();
        const list = json?.tafsirs || json?.data || json?.resources || [];
        setTafsirs(list);

        const preferred =
          list.find((x) => String(x?.name || "").includes("السعدي")) ||
          list.find((x) => String(x?.name || "").includes("ابن كثير")) ||
          list[0];

        if (preferred?.id) setTafsirId(preferred.id);
      } catch (e) {
        setTafsirs([]);
      }
    };

    fetchTafsirs();
  }, [i18n.language]);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const language = i18n.language || "ar";
        const response = await fetch(
          `${process.env.PUBLIC_URL}/data/suwar/suwar-${language}.json`
        );
        const result = await response.json();
        const list = result.suwar || [];
        setSurahs(list);

        if (list.length > 0) {
          const allProgress = window.api.getAllQuranProgress();
          let surahToLoad = list[0];
          let pageToLoad = list[0].start_page;
          let highestPage = 0;

          list.forEach((surah) => {
            const savedPage = allProgress[surah.id];
            if (
              savedPage &&
              savedPage >= surah.start_page &&
              savedPage <= surah.end_page &&
              savedPage > highestPage
            ) {
              highestPage = savedPage;
              surahToLoad = surah;
              pageToLoad = savedPage;
            }
          });

          if (highestPage === 0) {
            const allProgress2 = window.api.getAllQuranProgress();
            if (typeof allProgress2 === "number" && allProgress2 >= 1 && allProgress2 <= 604) {
              const surahForPage = list.find(
                (s) => allProgress2 >= s.start_page && allProgress2 <= s.end_page
              );
              if (surahForPage) {
                surahToLoad = surahForPage;
                pageToLoad = allProgress2;
                window.api.saveQuranProgress(surahForPage.id, allProgress2);
              }
            }
          }

          setSelectedSurah(surahToLoad);
          setSurahRange({ start: surahToLoad.start_page, end: surahToLoad.end_page });
          setCurrentPage(pageToLoad);

          if (pageToLoad !== surahToLoad.start_page) {
            setTimeout(() => {
              const pageEl = document.querySelector(`[data-page="${pageToLoad}"]`);
              if (pageEl && pageViewerRef.current) {
                pageEl.scrollIntoView({ behavior: "auto", block: "center" });
              }
            }, 300);
          }
        }

        setError(null);
      } catch (e) {
        console.error(e);
        setError(t("error_occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, [i18n.language, t]);

  const handleSelectSurah = useCallback(
    (surah) => {
      const range = { start: surah.start_page, end: surah.end_page };
      const savedPage = window.api.getQuranProgress(surah.id);
      const pageToLoad =
        savedPage && savedPage >= surah.start_page && savedPage <= surah.end_page
          ? savedPage
          : surah.start_page;

      // Batch all state updates together
      setSelectedSurah(surah);
      setSurahRange(range);
      setCurrentPage(pageToLoad);
      setSelectedVerse(null);
      setTafsirText("");
      setTafsirError(null);

      // Use requestAnimationFrame for smoother, non-blocking scroll operations
      requestAnimationFrame(() => {
        // Scroll indicator into view
        const indicatorEl = document.getElementById(`indicator-surah-${surah.id}`);
        if (indicatorEl && surahIndicatorRef.current) {
          indicatorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Scroll to page if needed (after a brief delay to allow DOM to update)
        if (pageToLoad !== surah.start_page) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const pageEl = document.querySelector(`[data-page="${pageToLoad}"]`);
              if (pageEl) {
                pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            });
          });
        }
      });
    },
    []
  );

  const handleResetProgress = useCallback(() => {
    if (!selectedSurah) return;
    window.api.clearQuranProgress(selectedSurah.id);
    setCurrentPage(selectedSurah.start_page);
  }, [selectedSurah]);

  useEffect(() => {
    if (selectedSurah && selectedSurah.id && currentPage >= 1 && currentPage <= 604) {
      if (currentPage <= selectedSurah.start_page) return;
      const savedPage = window.api.getQuranProgress(selectedSurah.id);
      if (!savedPage || currentPage > savedPage) {
        window.api.saveQuranProgress(selectedSurah.id, currentPage);
      }
    }
  }, [currentPage, selectedSurah]);

  const handlePageChange = useCallback((pageNum) => {
    setCurrentPage(pageNum);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target?.tagName === "INPUT") return;
      if (!selectedSurah) return;

      if (e.key === "Escape") {
        if (tafsirOpen) setTafsirOpen(false);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(surahRange.start, currentPage - 1);
        if (prev === currentPage) return;
        setCurrentPage(prev);
        const el = document.querySelector(`[data-page="${prev}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(surahRange.end, currentPage + 1);
        if (next === currentPage) return;
        setCurrentPage(next);
        const el = document.querySelector(`[data-page="${next}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, selectedSurah, surahRange.start, surahRange.end, tafsirOpen]);

  const handleSearch = (e) => setSearchText(e.target.value);

  const extractTafsirText = useCallback(
    (verseObj) => {
      if (!verseObj) return "";
      const t1 = verseObj?.tafsir?.text;
      if (typeof t1 === "string" && t1.trim()) return t1;

      const tafsirsArr = verseObj?.tafsirs;
      if (Array.isArray(tafsirsArr) && tafsirsArr.length) {
        const match =
          tafsirsArr.find((x) => String(x?.resource_id) === String(tafsirId)) ||
          tafsirsArr[0];
        const tx = match?.text;
        if (typeof tx === "string" && tx.trim()) return tx;
      }

      const t2 = verseObj?.tafsir_text;
      if (typeof t2 === "string" && t2.trim()) return t2;

      return "";
    },
    [tafsirId]
  );

  const loadTafsirForVerse = useCallback(
    async (chapter, verse) => {
      if (!chapter || !verse || !tafsirId) return;

      const cacheKey = `${tafsirId}:${chapter}`;
      const cached = tafsirCacheRef.current.get(cacheKey);

      setTafsirError(null);
      setTafsirLoading(true);

      try {
        let verseMap = cached;

        if (!verseMap) {
          const res = await fetch(
            `https://noorapi.vercel.app/api/verses?lang=${i18n.language}&chapter=${encodeURIComponent(chapter)}&tafsirs=${encodeURIComponent(
              tafsirId
            )}`
          );
          const json = await res.json();

          const verses = json?.verses || json?.data?.verses || json?.result?.verses || [];

          verseMap = new Map();
          for (const v of verses) {
            const num = Number(v?.verse_number ?? v?.verse_key?.split(":")?.[1]);
            if (!num) continue;
            verseMap.set(num, extractTafsirText(v));
          }

          tafsirCacheRef.current.set(cacheKey, verseMap);
        }

        const text = verseMap.get(Number(verse)) || "";
        setTafsirText(text || "لا يوجد تفسير لهذه الآية");
      } catch (e) {
        setTafsirError("فشل تحميل التفسير");
        setTafsirText("");
      } finally {
        setTafsirLoading(false);
      }
    },
    [tafsirId, extractTafsirText, i18n.language]
  );

  const handlePageClick = useCallback(
    (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const verseSpan = target.closest("span[data-verse]");
      if (!verseSpan) return;

      const verse = verseSpan.getAttribute("data-verse");
      const chapterSpan = verseSpan.closest("span[data-chapter]");
      const chapter = chapterSpan?.getAttribute("data-chapter");

      if (!chapter || !verse) return;

      setSelectedVerse({ chapter: Number(chapter), verse: Number(verse) });
      setTafsirOpen(true);
      setTafsirText("");
      setTafsirError(null);

      loadTafsirForVerse(Number(chapter), Number(verse));
    },
    [loadTafsirForVerse]
  );

  useEffect(() => {
    if (tafsirOpen && selectedVerse?.chapter && selectedVerse?.verse && tafsirId) {
      loadTafsirForVerse(selectedVerse.chapter, selectedVerse.verse);
    }
  }, [tafsirId, tafsirOpen, selectedVerse, loadTafsirForVerse]);

  const handleRefreshTafsirCache = useCallback(() => {
    if (!selectedVerse?.chapter || !tafsirId) return;
    const cacheKey = `${tafsirId}:${selectedVerse.chapter}`;
    tafsirCacheRef.current.delete(cacheKey);
    loadTafsirForVerse(selectedVerse.chapter, selectedVerse.verse);
  }, [selectedVerse, tafsirId, loadTafsirForVerse]);

  if (loading) {
    return (
      <div className="pt-6 bg-transparent text-text transition-all fadeIn min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 bg-transparent text-text transition-all fadeIn min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="pt-6 bg-transparent text-text transition-all fadeIn h-[calc(100vh-4rem)] flex flex-row gap-4 overflow-hidden">
      <SurahList
        surahs={surahs}
        searchText={searchText}
        onSearch={handleSearch}
        selectedSurah={selectedSurah}
        currentPage={currentPage}
        onSelectSurah={handleSelectSurah}
        onResetProgress={handleResetProgress}
        scale={scale}
        onScaleChange={setScaleUser}
        onToggleTafsir={() => setTafsirOpen((v) => !v)}
        surahIndicatorRef={surahIndicatorRef}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <PageViewer
          allPagesInSurah={allPagesInSurah}
          scale={scale}
          currentPage={currentPage}
          selectedSurah={selectedSurah}
          surahRange={surahRange}
          onPageClick={handlePageClick}
          pageViewerRef={pageViewerRef}
          onPageChange={handlePageChange}
        />

        <TafsirPanel
          tafsirOpen={tafsirOpen}
          onClose={() => setTafsirOpen(false)}
          tafsirs={tafsirs}
          tafsirId={tafsirId}
          onTafsirIdChange={setTafsirId}
          selectedVerse={selectedVerse}
          tafsirText={tafsirText}
          tafsirLoading={tafsirLoading}
          tafsirError={tafsirError}
          onRefresh={handleRefreshTafsirCache}
        />
      </div>
    </div>
  );
}

export default Quran;
