// src/components/Quran/ReciterCard.jsx
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "react-i18next";

function ReciterCard({ reciter, index, isFavorite, onSelect, onToggleFavorite, color }) {
    const { t } = useTranslation();
  return (
    <button
      className={`flex flex-col justify-between gap-4 m-auto p-4 w-full h-full rounded-lg text-start transition-all hover:bg-bg-color-3 bg-bg-color-2 border border-bg-color-3`}
      onClick={() => onSelect(reciter)}
    >
      <div className={`flex flex-row items-center justify-between gap-4 w-full`}>        
        <h1 className={`text-base font-medium text-text flex-1`}>
          {reciter.name}
        </h1>
        
        <div
          className={`bg-transparent text-text cursor-pointer hover:opacity-50 transition-all`}
          onClick={(e) => {
            onToggleFavorite(reciter.id);
            e.stopPropagation();
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <IconBookmarkFilled size={24} className={`text-${color()}-500`} />
          ) : (
            <IconBookmark size={24} />
          )}
        </div>
      </div>
      <div className={`flex flex-row items-center justify-between gap-4 w-full`}>
        <p className={`text-sm text-text-2`}>
          {reciter.moshaf.length > 1 ? `${reciter.moshaf.length} ${t("moshafs")}` : `${t("one_moshaf")}`}
        </p>
        <p className={`text-sm text-text-2`}>
          {reciter.moshaf[0].surah_list.split(",").length} {t("surahs")}
        </p>
      </div>
    </button>
  );
}

export default ReciterCard;