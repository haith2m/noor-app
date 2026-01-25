import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconPencil, IconChevronRight, IconChevronLeft, IconArrowUp, IconPlaylistOff } from "@tabler/icons-react";
import CreatePlaylistModal from "./CreatePlaylistModal";
import { usePage } from "../../PageContext";
import SurahCard from "../SurahCard";
import SearchBar from "../SearchBar";

function PlaylistView({ playlistId }) {
  const { t, i18n } = useTranslation();
  const { playAudio, audioState, togglePlayPause, setCurrentPage } = usePage();
  const [playlist, setPlaylist] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const playlists = window.api.getPlaylists() || [];
    const found = playlists.find(p => p.id === playlistId);
    setPlaylist(found);
  }, [playlistId]);
  
  useEffect(() => {
      const handleUpdate = () => {
        const playlists = window.api.getPlaylists() || [];
        const found = playlists.find(p => p.id === playlistId);
        setPlaylist(found);
      };
      window.api.receive("playlists-updated", handleUpdate);
      return () => window.api.removeListener("playlists-updated", handleUpdate);
  }, [playlistId]);

  const handleEditName = (newName) => {
    const playlists = window.api.getPlaylists() || [];
    const updated = playlists.map(p => 
        p.id === playlistId ? { ...p, name: newName } : p
    );
    window.api.savePlaylists(updated);
  };
  
  const handleRemoveSurah = (index) => {
      const playlists = window.api.getPlaylists() || [];
      const updated = playlists.map(p => {
          if (p.id === playlistId) {
              const newSurahs = [...(p.surahs || [])];
              newSurahs.splice(index, 1);
              return { ...p, surahs: newSurahs };
          }
          return p;
      });
      window.api.savePlaylists(updated);
  };
  
  const handlePlaySurah = (item) => {
      const { surah, reciter, moshaf } = item;
      
      if (audioState.surahName === surah.name && audioState.isPlaying && audioState.reciterId === reciter.id) {
        togglePlayPause();
      } else {
        const url = `${moshaf.server}${pad(surah.id, 3)}.mp3`;
        playAudio(
            url,
            surah.name,
            reciter.name,
            reciter.id,
            moshaf,
            surah.id
        );
      }
  };
  
  function pad(n, width, z = "0") {
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  if (!playlist) return null;

  const getColor = () => window.api.getColor();

  const filteredSurahs = (playlist.surahs || []).filter(item => {
    if (!searchText) return true;
    const normalizedSearch = searchText.toLowerCase().replace(/[أإآ]/g, "ا");
    const normalizedSurahName = item.surah.name.toLowerCase().replace(/[أإآ]/g, "ا");
    const normalizedReciterName = item.reciter.name.toLowerCase().replace(/[أإآ]/g, "ا");
    return normalizedSurahName.includes(normalizedSearch) || normalizedReciterName.includes(normalizedSearch);
  });

  return (
    <div
      className={`pt-8 bg-transparent text-text min-h-screen transition-all fadeIn w-full`}
    >
      <div className="flex flex-col items-start justify-center pb-4 px-2 gap-4">
          <button
            className={`flex flex-row w-fit items-center gap-2 mt-4 me-auto px-4 relative z-50 text-${window.api.getColor()}-500`}
            onClick={() => {
              setCurrentPage("quran-audio");
            }}
          >
            {i18n.language === "ar" ? (
              <IconChevronRight />
            ) : (
              <IconChevronLeft />
            )}
            <h1 className={`text-base font-medium`}>{t("return")}</h1>
          </button>
        <div className="flex items-center gap-3 px-4">
            <h1 className={`text-3xl font-medium text-start`}>
                {playlist.name}
            </h1>
            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-text-2 hover:text-text transition-colors mt-1"
                title={t("edit_playlist")}
            >
                <IconPencil size={20} />
            </button>
        </div>
      </div>
      
        <div className={`px-8`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 w-full">
                  <div className="flex-1">
                    <SearchBar
                      searchText={searchText}
                      onSearch={handleSearch}
                    />
                  </div>
                </div>
              </div>
              
                <div className="mt-4">
                {(playlist.surahs || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-text-2 gap-4">
                    <IconPlaylistOff size={64} stroke={1.5} />
                    <p className="text-xl font-medium">{t("empty_playlist")}</p>
                </div>
                ) : (
                    <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4 m-auto justify-center mt-2 w-full">
                        {filteredSurahs.map((item, index) => (
                            <div key={`${item.surah.id}-${index}`} className="relative group">
                                <SurahCard 
                                    surah={{...item.surah, reciterName: item.reciter.name}}
                                    color={getColor()}
                                    onSelect={() => handlePlaySurah(item)}
                                    currentSurah={audioState.surahName}
                                    currentReciterId={audioState.reciterId}
                                    isPlaying={audioState.isPlaying}
                                    reciterId={item.reciter.id}
                                    onDelete={() => handleRemoveSurah(index)}
                                />
                            </div>
                        ))}
                    </div>
                )}
                </div>

              <button
                onClick={scrollToTop}
                className={`fixed bottom-4 right-20 bg-${window.api.getColor()}-900 border border-${window.api.getColor()}-600 text-${window.api.getColor()}-500 p-1 rounded-full shadow-lg transition-all z-50 ${
                  showScrollTop ? "opacity-100" : "opacity-0"
                }`}
              >
                <IconArrowUp size={24} />
              </button>
        </div>
        
        <CreatePlaylistModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditName}
            initialName={playlist.name}
        />
    </div>
  );
}

export default PlaylistView;

