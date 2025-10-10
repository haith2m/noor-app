import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlaylist,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function SurahCard({ surah, color, onSelect, currentSurah, isPlaying, id, reciterId, onAddToPlaylist, playlists, onRemoveFromPlaylist, showRemoveButton, currentReciterId }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  
  const isCurrentlyPlaying = currentSurah === surah.name && isPlaying && String(currentReciterId) === String(reciterId);
  
  // Load progress when component mounts or reciterId/surahId changes
  useEffect(() => {
    const loadProgress = async () => {
      if (reciterId && surah.id) {
        try {
          const progressData = await window.api.getProgress(reciterId, surah.id);
          setProgress(progressData);
          if (progressData) {
            console.log(`Progress loaded for ${surah.name}: ${progressData.percentage}% at ${Math.floor(progressData.currentTime)}s`);
          }
        } catch (error) {
          console.error("Error loading progress:", error);
          setProgress(null);
        }
      }
    };
    
    loadProgress();
  }, [reciterId, surah.id, surah.name]);

  // Refresh progress more frequently for currently playing surah
  useEffect(() => {
    if (!isCurrentlyPlaying || !reciterId || !surah.id) return;

    const loadProgress = async () => {
      try {
        const progressData = await window.api.getProgress(reciterId, surah.id);
        setProgress(progressData);
        if (progressData) {
          console.log(`Progress updated for currently playing ${surah.name}: ${progressData.percentage}% at ${Math.floor(progressData.currentTime)}s`);
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };
    
    // Update progress every 2 seconds for currently playing surah
    const interval = setInterval(loadProgress, 2000);
    
    return () => clearInterval(interval);
  }, [isCurrentlyPlaying, reciterId, surah.id, surah.name]);
  
  const handleClick = (e) => {
    onSelect();
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
      <div
        id={id}
        className={`flex flex-col relative gap-2 p-4 rounded-lg text-start w-full transition-all cursor-pointer ${
          isCurrentlyPlaying
            ? `bg-${color}-500/20`
            : "bg-bg-color-2 hover:bg-bg-color-3"
        }`}
        onClick={handleClick}
      >
      <div className="flex flex-row justify-between items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <span className="text-sm text-text-2 font-mono">{surah.id}.</span>
          <div className="flex flex-col">
            <h1 className="font-medium leading-5">{surah.name}</h1>
            {surah.reciterName && <span className="text-xs text-text-2">{surah.reciterName}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`size-10 rounded-full bg-${window.api.getColor()}-500/25 text-${window.api.getColor()}-500 flex items-center justify-center shrink-0`}
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
          {onAddToPlaylist && playlists && playlists.length > 0 && (
            <button
              className={`size-8 rounded-full bg-bg-color-3 text-text-2 hover:text-${window.api.getColor()}-500 hover:bg-${window.api.getColor()}-500/20 flex items-center justify-center shrink-0 transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(e, surah);
              }}
              title={t('add_to_playlist')}
            >
              <IconPlaylist size={16} />
            </button>
          )}
          {showRemoveButton && onRemoveFromPlaylist && (
            <button
              className={`size-8 rounded-full bg-bg-color-3 text-text-2 hover:text-red-500 hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromPlaylist(surah.reciterId);
              }}
              title={t('remove_from_playlist')}
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      </div>
      {progress && <div style={{width: `${progress.percentage}%`}} className={`absolute bottom-0 start-0 h-1 bg-${window.api.getColor()}-500 rounded-full rounded-s-none`}></div>}
    </div>
  );
}

export default SurahCard;