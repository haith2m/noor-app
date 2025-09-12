/* eslint-disable react-hooks/exhaustive-deps */
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlaylist,
  IconPlaylistOff,
  IconRepeat,
  IconRepeatOff,
  IconVolume,
  IconVolumeOff,
  IconX,
} from "@tabler/icons-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "../../PageContext";
import Tooltip from "../Tooltip";

function AudioPlayer() {
  const { t, i18n } = useTranslation();
  const { 
    audioState, 
    updateAudioState, 
    togglePlayPause, 
    handleAudioEnded,
    closeAudioPlayer, 
    audioRef 
  } = usePage();

  const {
    audioUrl,
    surahName,
    reciterName,
    isPlaying,
    currentTime,
    duration,
    volume,
    autoplay,
    repeat,
  } = audioState;

  // Handle audio events
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      updateAudioState({ duration: audio.duration });
    };

    const handleTimeUpdate = () => {
      updateAudioState({ currentTime: audio.currentTime });
    };

    const handlePlay = () => {
      updateAudioState({ isPlaying: true });
    };

    const handlePause = () => {
      updateAudioState({ isPlaying: false });
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleAudioEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleAudioEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Update audio source when audioUrl changes
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (audioUrl && audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.crossOrigin = "anonymous";
      audio.volume = volume;
      audio.load();
      
      // Only auto-play if this is a new audio source and isPlaying is true
      if (isPlaying) {
        audio.play().catch((error) => console.error("Error playing audio:", error));
      }
    }

    // Set Media Session Metadata
    if ("mediaSession" in navigator && audioUrl) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: surahName || "Quran Surah",
        artist: reciterName || "Unknown Reciter",
      });
    }
  }, [audioUrl, surahName, reciterName, volume]);

  // Handle play/pause state changes separately
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;

    if (isPlaying && audio.paused) {
      audio.play().catch((error) => console.error("Error playing audio:", error));
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // Format time in mm:ss
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours ? hours + ":" : ""}${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  // Handle progress bar change
  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      updateAudioState({ currentTime: newTime });
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    updateAudioState({ volume: newVolume });
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    localStorage.setItem("volume", newVolume);
  };

  // Custom slider background styles
  const getSliderBackground = (value, max) => {
    const percentage = (value / max) * 100;
    return `${percentage}% 100%`;
  };

  // Toggle controls for repeat and autoplay
  const toggleControls = (control) => {
    if (control === "repeat") {
      const newRepeat = !repeat;
      updateAudioState({ repeat: newRepeat, autoplay: false });
      localStorage.setItem("repeat", newRepeat);
      localStorage.setItem("autoplay", false);
    } else if (control === "autoplay") {
      const newAutoplay = !autoplay;
      updateAudioState({ autoplay: newAutoplay, repeat: false });
      localStorage.setItem("repeat", false);
      localStorage.setItem("autoplay", newAutoplay);
    }
  };

  // Don't render if no audio is loaded
  if (!audioUrl) return null;

  return (
    <div tabIndex={1} className="fixed bottom-0 end-0 bg-bg-color border-t border-bg-color-3 p-4 flex w-[calc(100%_-_4rem)] items-center justify-between z-[100]">
      <div className="flex flex-col text-start pe-4">
        <span className="text-sm font-medium text-text">
          {surahName ? `${t("surah")} ${surahName}` : ""}
        </span>
        <span className="text-sm text-text-2">
          {reciterName || t("unknown_reciter")}
        </span>
      </div>

      <div className="flex justify-center items-center text-xs text-text-2 gap-4">
        <Tooltip message={t("autoplay")}>
          <button
            onClick={() => toggleControls("autoplay")}
            className={`text-sm ${
              autoplay ? `text-${window.api.getColor()}-500` : "text-text-2"
            }`}
            aria-label={t("autoplay")}
          >
            {autoplay ? <IconPlaylist /> : <IconPlaylistOff />}
          </button>
        </Tooltip>
        
        <button onClick={togglePlayPause} className="">
          {isPlaying ? (
            <IconPlayerPauseFilled size={24} />
          ) : (
            <IconPlayerPlayFilled size={24} />
          )}
        </button>
        
        <Tooltip message={t("repeat")}>
          <button
            onClick={() => toggleControls("repeat")}
            className={`text-sm ${
              repeat ? `text-${window.api.getColor()}-500` : "text-text-2"
            }`}
            aria-label={t("repeat")}
          >
            {repeat ? <IconRepeat /> : <IconRepeatOff />}
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2 flex-1 mx-4">
        <div className="flex justify-between items-center text-xs gap-2 w-full text-text-2">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full appearance-none bg-bg-color-2 transition-all progress-bar"
            style={{
              backgroundSize: getSliderBackground(currentTime, duration),
              backgroundPositionX: `${i18n.language === "ar" ? 100 : 0}%`,
            }}
            aria-label={t("playback_progress")}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-text-2 group">
        {volume === 0 ? (
          <IconVolumeOff className="group" size={24} />
        ) : (
          <IconVolume className="group" size={24} />
        )}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="appearance-none bg-bg-color-2 w-0 opacity-0 transition-all group-hover:opacity-100 group-hover:w-24"
          style={{
            backgroundSize: getSliderBackground(volume, 1),
            backgroundPositionX: `${i18n.language === "ar" ? 100 : 0}%`,
          }}
          aria-label={t("volume_control")}
        />
      </div>

      <button
        onClick={closeAudioPlayer}
        className="text-text-2 hover:text-text transition-colors ms-4"
        aria-label={t("close")}
      >
        <IconX size={16} />
      </button>
    </div>
  );
}

export default AudioPlayer;