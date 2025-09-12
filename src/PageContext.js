import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [settings, setSettings] = useState({
    language: "ar",
    theme: "light",
  });

  // Global audio player state
  const [audioState, setAudioState] = useState({
    audioUrl: null,
    surahName: "",
    reciterName: "",
    reciterId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    autoplay: localStorage.getItem("autoplay") === "true",
    repeat: localStorage.getItem("repeat") === "true",
    volume: parseFloat(localStorage.getItem("volume")) || 1,
    selectedMoshaf: null,
    suwarList: [],
  });

  const audioRef = useRef(null);

  useEffect(() => {
    setSettings(window.api.getSettings());
    setCurrentPage(window.api.getPage());
  }, []);

  const editSettings = (newSettings) => {
    window.api.setSettings(newSettings);
  };

  // Audio player functions
  const updateAudioState = (updates) => {
    if (updates.selectedMoshaf) {
      console.log("Updating selectedMoshaf:", updates.selectedMoshaf);
    }
    setAudioState(prev => ({ ...prev, ...updates }));
  };

  const playAudio = (audioUrl, surahName, reciterName, reciterId, selectedMoshaf) => {
    setAudioState(prev => ({
      ...prev,
      audioUrl,
      surahName,
      reciterName,
      reciterId,
      selectedMoshaf,
      isPlaying: true,
    }));
  };

  const setSuwarList = (suwarList) => {
    console.log("setSuwarList called with:", suwarList.length, "surahs");
    setAudioState(prev => ({ ...prev, suwarList }));
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.isPlaying) {
      audio.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audio.play().catch(error => console.error("Error playing audio:", error));
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleAudioEnded = () => {
    // Get current state dynamically to avoid stale closure
    setAudioState(currentState => {
      console.log("Current state in handleAudioEnded:", {
        repeat: currentState.repeat,
        autoplay: currentState.autoplay,
        suwarListLength: currentState.suwarList.length,
        selectedMoshaf: currentState.selectedMoshaf ? "exists" : "null"
      });

      if (currentState.repeat) {
        // Repeat current surah - replay cached audio without refetching
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          setTimeout(() => {
            audio.play().catch(error => console.error("Error playing audio:", error));
          }, 1000);
        }
        // Return current state without changing audioUrl to avoid refetching
        return { ...currentState, currentTime: 0, isPlaying: true };
      } else if (currentState.autoplay && currentState.suwarList.length > 0 && currentState.selectedMoshaf) {
        // Play next surah
        const currentIndex = currentState.suwarList.findIndex(s => s.name === currentState.surahName);
        const nextSurah = currentState.suwarList[currentIndex + 1];
        
        if (nextSurah) {
          // Helper function to pad numbers
          const pad = (n, width, z = "0") => {
            n = n + "";
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
          };
          
          const url = `${currentState.selectedMoshaf.server}${pad(nextSurah.id, 3)}.mp3`;
          
          // Update state to play next surah
          return {
            ...currentState,
            audioUrl: url,
            surahName: nextSurah.name,
            isPlaying: true,
          };
        } else {
          // No more surahs, stop playing
          return { ...currentState, isPlaying: false };
        }
      } else {
        // Just stop playing
        return { ...currentState, isPlaying: false };
      }
    });
  };

  const closeAudioPlayer = () => {
    // set all state and its properties to null
    setAudioState(prev => ({
      ...prev,
      audioUrl: null,
      surahName: "",
      reciterName: "",
      reciterId: null,
      isPlaying: false,
      currentTime: 0,
    }));

    audioRef.current.pause();
  };

  return (
    <PageContext.Provider
      value={{ 
        currentPage, 
        setCurrentPage, 
        settings, 
        editSettings,
        audioState,
        updateAudioState,
        playAudio,
        setSuwarList,
        togglePlayPause,
        handleAudioEnded,
        closeAudioPlayer,
        audioRef,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
};
