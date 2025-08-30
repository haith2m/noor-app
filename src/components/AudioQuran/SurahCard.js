import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { compatibleAPI } from "../../utils/webCompatibility";

function SurahCard({ surah, color, onSelect, currentSurah, isPlaying, id }) {
  const { t } = useTranslation();
  const handleClick = (e) => {
    onSelect();
  };

  const isCurrentlyPlaying = currentSurah === surah.name && isPlaying;

  return (
    <div
      id={id}
      className={`flex flex-row justify-between items-center gap-4 p-4 rounded-lg text-start w-full transition-all cursor-pointer ${
        currentSurah === surah.name
          ? `bg-${color}-500/20`
          : "bg-bg-color-2 hover:bg-bg-color-3"
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm text-text-2 font-mono">{surah.id}.</span>
        <h1 className={`font-medium leading-5`}>
          {surah.name}<br/>
          <span className="text-sm text-text-2">
            {surah.makkia === 1 ? t("makkiah") : t("madani")}
          </span>
        </h1>
      </div>
      <button
        className={`size-10 rounded-full bg-${compatibleAPI.getColor()}-500/25 text-${compatibleAPI.getColor()}-500 flex items-center justify-center shrink-0`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isCurrentlyPlaying ? (
          <IconPlayerPauseFilled size={24} />
        ) : (
          <IconPlayerPlayFilled size={24} />
        )}
      </button>
    </div>
  );
}

export default SurahCard;
