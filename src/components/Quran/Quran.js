import "react-quran/fonts/index.css";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import QuranPage from "./QuranPage";
import i18n from "../../i18n";
function Quran() {
  const { t } = useTranslation();
  const [page, setPage] = useState(2); // Start with page 2 so we can show 1 and 2

  const goToPreviousPage = () => {
    if (page > 2) {
      setPage(page - 2);
    }
  };

  const goToNextPage = () => {
    if (page < 604) {
      setPage(page + 2);
    }
  };

  const leftPage = page - 1;
  const rightPage = page;

  console.log(leftPage, rightPage);

  return (
    <div
      className={`pt-6 bg-transparent text-text transition-all fadeIn`}
    >
      <div className="flex flex-col items-center justify-center pb-4 px-2 gap-4">
        <h1 className={`text-3xl font-medium text-center px-4`}>
          {t("quran")}
        </h1>

        {/* Book View Container */}
        <div className="flex gap-2 overflow-hidden relative">
          <QuranPage page={leftPage} position="left" />
          <QuranPage page={rightPage} position="right" />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={goToPreviousPage}
            disabled={page <= 2}
            className={`p-2 rounded-lg transition-all ${
              page <= 2
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-bg-color-2 active:scale-95"
            }`}
          >
            {i18n.language === "ar" ? (
              <IconChevronRight />
            ) : (
              <IconChevronLeft />
            )}
          </button>

          <span className="text-lg font-medium px-4">
            {t("page")} {leftPage} - {rightPage}
          </span>

          <button
            onClick={goToNextPage}
            disabled={page >= 604}
            className={`p-2 rounded-lg transition-all ${
              page >= 604
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-bg-color-2 active:scale-95"
            }`}
          >
            {i18n.language === "ar" ? (
              <IconChevronLeft />
            ) : (
              <IconChevronRight />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-2">{t("go_to_page")}:</label>
          <input
            type="number"
            min="1"
            max="604"
            value={rightPage}
            onChange={(e) => {
              const newPage = parseInt(e.target.value);
              if (isNaN(newPage)) {
                setPage(1);
              } else if (newPage > 604) {
                setPage(604);
              } else if (newPage < 1) {
                setPage(1);
              } else {
                setPage(newPage);
              }
            }}
            className="w-20 px-2 py-1 text-center bg-bg-color-2 border border-bg-color-3 rounded text-text"
          />
        </div>
      </div>
    </div>
  );
}

export default Quran;
