import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    return window.api.getPage() || "home";
  });
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
    // setCurrentPage is already initialized
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

  const playAudio = async (audioUrl, surahName, reciterName, reciterId, selectedMoshaf, surahId) => {
    // Check for existing progress
    let startTime = 0;
    if (reciterId && surahId) {
      try {
        const progress = await window.api.getProgress(reciterId, surahId);
        if (progress) {
          startTime = progress.currentTime;
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    }

    setAudioState(prev => ({
      ...prev,
      audioUrl,
      surahName,
      reciterName,
      reciterId,
      surahId,
      selectedMoshaf,
      isPlaying: true,
      currentTime: startTime,
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
      // Save progress when pausing
      saveProgress();
      audio.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audio.play().catch(error => console.error("Error playing audio:", error));
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const saveProgress = async (customState = null) => {
    // Use current audio state or provided state
    const state = customState || audioState;
    const { reciterId, surahId, currentTime, duration } = state;
    
    // Get actual current time from audio element if available
    const actualCurrentTime = audioRef.current ? audioRef.current.currentTime : currentTime;
    const actualDuration = audioRef.current ? audioRef.current.duration : duration;
    
    if (reciterId && surahId && actualCurrentTime && actualDuration) {
      try {
        await window.api.saveProgress(reciterId, surahId, actualCurrentTime, actualDuration);
        console.log(`Progress saved (manual): ${reciterId}-${surahId} at ${Math.floor(actualCurrentTime)}s`);
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    } else {
      console.log('Progress save skipped - missing data:', { reciterId, surahId, actualCurrentTime, actualDuration });
    }
  };

  const handleAudioEnded = async () => {
    // Clear progress since surah completed naturally
    const { reciterId, surahId } = audioState;
    if (reciterId && surahId) {
      try {
        await window.api.clearProgress(reciterId, surahId);
      } catch (error) {
        console.error("Error clearing progress:", error);
      }
    }

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
        // Filter surahs to only include ones the reciter has
        const availableSurahIds = currentState.selectedMoshaf.surah_list.split(",");
        const availableSurahs = currentState.suwarList.filter(surah => 
          availableSurahIds.includes(surah.id.toString())
        );
        
        console.log(`Reciter has ${availableSurahs.length} surahs available for autoplay`);
        
        // Find current surah in the filtered list
        const currentIndex = availableSurahs.findIndex(s => s.name === currentState.surahName);
        const nextSurah = availableSurahs[currentIndex + 1];
        
        if (nextSurah) {
          // Helper function to pad numbers
          const pad = (n, width, z = "0") => {
            n = n + "";
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
          };
          
          const url = `${currentState.selectedMoshaf.server}${pad(nextSurah.id, 3)}.mp3`;
          
          console.log(`Autoplay: Moving to next surah - ${nextSurah.name} (ID: ${nextSurah.id})`);
          
          // Update state to play next surah
          return {
            ...currentState,
            audioUrl: url,
            surahName: nextSurah.name,
            surahId: nextSurah.id,
            isPlaying: true,
            currentTime: 0, // Reset to start from beginning
            duration: 0, // Reset duration for new surah
          };
        } else {
          // No more surahs available for this reciter, stop playing
          console.log("Autoplay: Reached end of available surahs for this reciter");
          return { ...currentState, isPlaying: false };
        }
      } else {
        // Just stop playing
        return { ...currentState, isPlaying: false };
      }
    });
  };

  const closeAudioPlayer = async () => {
    // Save progress before closing
    await saveProgress();
    
    // set all state and its properties to null
    setAudioState(prev => ({
      ...prev,
      audioUrl: null,
      surahName: "",
      reciterName: "",
      reciterId: null,
      surahId: null,
      isPlaying: false,
      currentTime: 0,
    }));

    if (audioRef.current) {
      audioRef.current.pause();
    }
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
        saveProgress,
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
