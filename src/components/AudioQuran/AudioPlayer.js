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
} from "@tabler/icons-react";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Tooltip from "../Tooltip";

function AudioPlayer({
  audioUrl,
  surahName,
  reciterName,
  reciterId,
  setAutoplay,
  autoplay,
  setRepeat,
  repeat,
  handleOnEnded,
  isPlaying,
  setIsPlaying,
  audioElement,
}) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(
    parseFloat(localStorage.getItem("volume")) || 1
  );

  useEffect(() => {
    const audio = audioElement.current;

    // Update the audio source
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.crossOrigin = "anonymous";
      audio.volume = volume;
      audio.load();
      
      if (autoplay || isPlaying) {
        audio
          .play()
          .catch((error) => console.error("Error playing audio:", error));
        setIsPlaying(true);
      }
    }

    // Set Media Session Metadata
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: surahName || "Quran Surah",
        artist: reciterName || "Unknown Reciter",
      });
    }
  }, [audioUrl, surahName, reciterName, autoplay, isPlaying]);

  // Handle audio events
  useEffect(() => {
    const audio = audioElement.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleOnEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleOnEnded);
    };
  }, [autoplay, repeat, handleOnEnded]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    const audio = audioElement.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

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
    audioElement.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioElement.current.volume = newVolume;
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
      setRepeat(!repeat);
      setAutoplay(false);
      localStorage.setItem("repeat", !repeat);
      localStorage.setItem("autoplay", false);
    } else if (control === "autoplay") {
      setAutoplay(!autoplay);
      setRepeat(false);
      localStorage.setItem("repeat", false);
      localStorage.setItem("autoplay", !autoplay);
    }
  };

  return (
    <div className="fixed bottom-0 end-0 bg-bg-color border-t border-bg-color-3 p-4 flex w-[calc(100%_-_4rem)] items-center justify-between z-[100]">
      <div className="flex flex-row items-center justify-start gap-4 w-fit">
        <div className="flex flex-col text-start">
          <span className="text-sm font-medium text-text">
            {surahName ? `${t("surah")} ${surahName}` : ``}
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
          <button
            onClick={togglePlayPause}
            className=""
          >
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
      </div>

      <div className="flex flex-row items-center flex-1 mx-4">
        <div className="flex justify-between items-center text-xs gap-2 w-full">
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

      <audio ref={audioElement} onEnded={handleOnEnded} />
    </div>
  );
}

export default AudioPlayer;
