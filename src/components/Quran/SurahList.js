import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../SearchBar";
import Tooltip from "../Tooltip";
import { IconCircle, IconRefresh, IconBook2 } from "@tabler/icons-react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function SurahList({
  surahs,
  searchText,
  onSearch,
  selectedSurah,
  currentPage,
  onSelectSurah,
  onResetProgress,
  scale,
  onScaleChange,
  onToggleTafsir,
  surahIndicatorRef,
}) {
  const { t } = useTranslation();
  const color = window.api.getColor?.() || "blue";

  const filteredSurahs = useMemo(() => {
    if (!searchText) return surahs;
    const normalizedSearchText = searchText.toLowerCase().replace(/[أإآ]/g, "ا");
    return surahs.filter((surah) => {
      const normalizedName = surah.name.toLowerCase().replace(/[أإآ]/g, "ا");
      const surahId = surah.id.toString();
      return normalizedName.includes(normalizedSearchText) || surahId.includes(searchText);
    });
  }, [surahs, searchText]);

  return (
    <div className="w-64 flex flex-col border-r border-bg-color-3 bg-bg-color/50 h-full overflow-hidden">
      <div className="p-4 border-b border-bg-color-3 flex-shrink-0">
        <h2 className="text-lg font-medium mb-3">{t("surahs")}</h2>

        <div className="mb-3">
          <SearchBar searchText={searchText} onSearch={onSearch} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            className="px-2 py-1 rounded bg-bg-color-2 hover:bg-bg-color-3 text-sm"
            onClick={() =>
              onScaleChange((s) => clamp(Math.round((s - 0.05) * 100) / 100, 0.8, 1.4))
            }
          >
            -
          </button>
          <div className="text-xs text-text-2 w-16 text-center">{Math.round(scale * 100)}%</div>
          <button
            className="px-2 py-1 rounded bg-bg-color-2 hover:bg-bg-color-3 text-sm"
            onClick={() =>
              onScaleChange((s) => clamp(Math.round((s + 0.05) * 100) / 100, 0.8, 1.4))
            }
          >
            +
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-text-2">
            {t("page")} {currentPage}
            {selectedSurah ? ` (${selectedSurah.start_page}-${selectedSurah.end_page})` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip message={t("tafsir") || "التفسير"}>
              <button
                onClick={onToggleTafsir}
                className="p-1.5 rounded hover:bg-bg-color-2 text-text-2 hover:text-text transition-colors"
              >
                <IconBook2 size={16} />
              </button>
            </Tooltip>

            {selectedSurah && window.api.getQuranProgress(selectedSurah.id) && (
              <Tooltip message={t("reset_progress") || "Reset Progress"}>
                <button
                  onClick={onResetProgress}
                  className="p-1.5 rounded hover:bg-bg-color-2 text-text-2 hover:text-text transition-colors"
                >
                  <IconRefresh size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div ref={surahIndicatorRef} className="flex-1 overflow-y-auto p-4 min-h-0">
        {filteredSurahs.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8">
            <p className="text-sm font-medium text-text-2">{t("no_results")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredSurahs.map((surah) => {
              const isActive = currentPage >= surah.start_page && currentPage <= surah.end_page;
              const savedPage = window.api.getQuranProgress(surah.id);
              const hasProgress =
                savedPage && savedPage >= surah.start_page && savedPage <= surah.end_page;

              return (
                <div
                  id={`indicator-surah-${surah.id}`}
                  key={surah.id}
                  className={`group flex flex-row items-center border gap-2 p-2 rounded-lg text-start w-full transition-all cursor-pointer relative ${
                    isActive
                      ? `bg-${color}-500/20 text-${color}-500 border-${color}-500`
                      : "hover:bg-bg-color-2 border-transparent"
                  }`}
                  onClick={() => onSelectSurah(surah)}
                >
                  <span className="text-xs text-text-2 font-mono min-w-[2rem]">{surah.id}.</span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm leading-4 truncate">{surah.name}</h3>
                      {hasProgress && !isActive && (
                        <IconCircle size={6} className={`text-${color}-500 fill-${color}-500 shrink-0`} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-2">
                        {t("page")} {surah.start_page}
                        {surah.end_page !== surah.start_page && `-${surah.end_page}`}
                      </span>
                      {hasProgress && (
                        <>
                          <span className="text-xs text-text-2 opacity-60">•</span>
                          <span className="text-xs text-text-2">
                            {Math.round(
                              ((savedPage - surah.start_page + 1) /
                                (surah.end_page - surah.start_page + 1)) *
                                100
                            )}
                            %
                          </span>
                        </>
                      )}
                    </div>
                    {hasProgress && (
                      <div className="mt-1.5 h-0.5 bg-bg-color-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${color}-500 transition-all duration-300`}
                          style={{
                            width: `${Math.round(
                              ((savedPage - surah.start_page + 1) /
                                (surah.end_page - surah.start_page + 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SurahList;

