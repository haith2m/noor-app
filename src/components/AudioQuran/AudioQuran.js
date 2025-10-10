/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
// src/components/Quran/Quran.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";
import ReciterCard from "./ReciterCard";
import SurahCard from "../SurahCard";
import SearchBar from "./SearchBar";
import PlaylistModal from "./PlaylistModal";
import PlaylistContextMenu from "./PlaylistContextMenu";
import { usePage } from "../../PageContext";
import MoshafSelector from "./MoshafSelector";
import {
  IconBookmarkFilled,
  IconChevronLeft,
  IconChevronRight,
  IconWorldOff,
  IconArrowUp,
  IconPlaylist,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";

function AudioQuran({ Reciter }) {
  const { t, i18n } = useTranslation();
  const [reciter, setReciter] = useState();
  const [reciters, setReciters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [suwar, setSuwar] = useState([]);
  const [showMoreReciters, setShowMoreReciters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [error, setError] = useState(null);
  const [selectedMoshaf, setSelectedMoshaf] = useState(null);
  const [surahSearchText, setSurahSearchText] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [playlistContextMenu, setPlaylistContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    surah: null
  });
  const [playlists, setPlaylists] = useState([]);
  const recitersListRef = useRef(null);
  const surahsListRef = useRef(null);

  const {
    currentPage,
    setCurrentPage,
    currentPlaylist,
    setPlaylist,
    clearPlaylist,
    audioState,
    playAudio,
    togglePlayPause,
    setSuwarList,
    updateAudioState,
  } = usePage();

  useEffect(() => {
    const loadPlaylists = () => {
      try {
        const savedPlaylists = window.api.getPlaylists();
        setPlaylists(savedPlaylists);
      } catch (error) {
        console.error('Error loading playlists:', error);
      }
    };
    loadPlaylists();
  }, []);

  // Playlist functions
  const handleAddToPlaylist = (playlistId, surah) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if the same surah from the same reciter already exists
        const surahExists = playlist.surahs.some(s => 
          s.id === surah.id && s.reciterId === reciter?.id
        );
        if (!surahExists) {
          // Add reciter information to the surah
          const surahWithReciter = {
            ...surah,
            reciterId: reciter?.id,
            reciterName: reciter?.name
          };
          return {
            ...playlist,
            surahs: [...playlist.surahs, surahWithReciter],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return playlist;
    });
    
    try {
      window.api.setPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const removeSurahFromPlaylist = (playlistId, surahId, reciterId) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          surahs: playlist.surahs.filter(surah => 
            !(surah.id === surahId && surah.reciterId === reciterId)
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return playlist;
    });
    try {
      window.api.setPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
      // Update selectedPlaylist if it's the one being modified
      if (currentPlaylist && currentPlaylist.id === playlistId) {
        const updatedPlaylist = updatedPlaylists.find(p => p.id === playlistId);
        setPlaylist(updatedPlaylist);
      }
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setPlaylist(playlist);
    setCurrentPage("playlist-view");
  };

  const handleSurahRightClick = (e, surah) => {
    e.preventDefault();
    setPlaylistContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      surah
    });
  };

  const closePlaylistContextMenu = () => {
    setPlaylistContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      surah: null
    });
  };

  // Additional playlist functions
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      surahs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    try {
      window.api.setPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const updatePlaylist = (id, name) => {
    const updatedPlaylists = playlists.map(playlist => 
      playlist.id === id 
        ? { ...playlist, name, updatedAt: new Date().toISOString() }
        : playlist
    );
    try {
      window.api.setPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const deletePlaylist = (id) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
    try {
      window.api.setPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (name) => {
    if (editingPlaylist) {
      updatePlaylist(editingPlaylist.id, name);
    } else {
      createPlaylist(name);
    }
    setIsModalOpen(false);
    setEditingPlaylist(null);
  };

  useEffect(() => {
    const fetchSuwar = async () => {
      try {
        const language = window.api.getSettings()?.language || "ar";
        const response = await fetch(
          `${process.env.PUBLIC_URL}/suwar-${language}.json`
        );
        const result = await response.json();
        setSuwar(result.suwar);
        setSuwarList(result.suwar);
        console.log("Setting suwar list:", result.suwar.length, "surahs");

      } catch (error) {
        console.error("Error fetching suwar:", error);
        setError(t("error_occurred"));
      }
    };

    const checkOnlineStatus = async () => {
      try {
        // check if the user is online by checking if the cloudflare trace is working
        const response = await fetch("https://cloudflare.com/cdn-cgi/trace", {
          method: "HEAD",
          cache: "no-store",
        });
        setIsOnline(response.ok);
        return response.ok;
      } catch (error) {
        setIsOnline(false);
        return false;
      }
    };

    checkOnlineStatus().then((isOnline) => {
      if (isOnline) {
        fetchSuwar();
      }
    });
    const language = window.api.getSettings().language || "ar";

    fetch(`${process.env.PUBLIC_URL}/reciters-${language}.json`)
      .then((res) => res.json())
      .then(
        (result) => {
          setReciters(result.reciters);
          if (Reciter) {
            const foundReciter = result.reciters.find(
              (reciter) => reciter.id == Reciter
            );
            setReciter(foundReciter);
            if (foundReciter) {
              if (foundReciter.moshaf.length > 1) {
                setSelectedMoshaf(null);
              } else if (foundReciter.moshaf.length === 1) {
                setSelectedMoshaf(foundReciter.moshaf[0]);
              }
            }
          }
          const favoriteIds = window.api.getFavorites();
          setFavorites(new Set(favoriteIds));
        },
        (error) => {
          setError(t("error_occurred"));
        }
      );
  }, [t, Reciter]);

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

  const handleSearch = (e) => {
    const input = e.target.value.toLowerCase();

    // If we're in reciter selection mode, set the general search text
    if (!reciter) {
      setSearchText(input);

      if (input === "") {
        setSearchResults([]);
      } else {
        const normalizedInput = input.replace(/[أإآ]/g, "ا");

        // Filter reciters
        const filteredReciters = reciters.filter((reciter) => {
          const normalizedName = reciter.name
            .toLowerCase()
            .replace(/[أإآ]/g, "ا");
          return normalizedName.includes(normalizedInput);
        });

        // Set search results with the reciter type
        setSearchResults(
          filteredReciters.map((reciter) => ({ ...reciter, type: "reciter" }))
        );
      }
    }
    // If we're in surah selection mode, only update the surah search
    else if (reciter && selectedMoshaf) {
      setSurahSearchText(input);
    }
  };

  const handleToggleFavorite = (reciterId) => {
    window.api.toggleFavorite(reciterId);

    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(reciterId)) {
        newFavorites.delete(reciterId);
      } else {
        newFavorites.add(reciterId);
      }
      return newFavorites;
    });
  };

  const handleSelectPlaylistSurah = (surah) => {
    if (audioState.surahName === surah.name && audioState.isPlaying && audioState.reciterId === surah.reciterId) {
      togglePlayPause();
    } else {
      // Find the reciter and moshaf for this surah
      const surahReciter = reciters.find(r => r.id === surah.reciterId);
      if (surahReciter) {
        // Use the first moshaf for now, or we could store moshaf info in the playlist
        const moshaf = surahReciter.moshaf[0];
        if (moshaf) {
          const url = `${moshaf.server}${pad(surah.id, 3)}.mp3`;
          playAudio(
            url,
            surah.name,
            surahReciter.name,
            surahReciter.id,
            moshaf,
            surah.id
          );
        }
      }
    }
  };

  const handleSelectSurah = (surahId) => {
    const selectedSurah = suwar.find((s) => s.id === surahId);
    if (audioState.surahName === selectedSurah.name && audioState.isPlaying) {
      togglePlayPause();
    } else {
      if (selectedSurah && reciter && selectedMoshaf) {
        const url = `${selectedMoshaf.server}${pad(selectedSurah.id, 3)}.mp3`;
        playAudio(
          url,
          selectedSurah.name,
          reciter.name,
          reciter.id,
          selectedMoshaf,
          selectedSurah.id
        );
      }
    }
  };

  const handleSelectMoshaf = (moshaf) => {
    setSelectedMoshaf(moshaf);
    // Update global state with selected moshaf
    updateAudioState({ selectedMoshaf: moshaf });
  };

  const handleSelectReciter = (reciter) => {
    setReciter(reciter);
    setCurrentPage(`quran-audio-${reciter.id}`);

    if (reciter.moshaf.length > 1) {
      setSelectedMoshaf(null);
      updateAudioState({ selectedMoshaf: null });
    } else if (reciter.moshaf.length === 1) {
      setSelectedMoshaf(reciter.moshaf[0]);
      updateAudioState({ selectedMoshaf: reciter.moshaf[0] });
    }
  };

  const displayedReciters = searchText ? searchResults : reciters;
  const hasMoreReciters = showMoreReciters
    ? displayedReciters.length
    : 11 + favorites.size;

  const getColor = () => window.api.getColor();

  function pad(n, width, z = "0") {
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredSurahs = (audioState.suwarList || suwar).filter((surah) => {
    if (!surahSearchText) return true;

    const normalizedSearchText = surahSearchText
      .toLowerCase()
      .replace(/[أإآ]/g, "ا");
    const normalizedName = surah.name.toLowerCase().replace(/[أإآ]/g, "ا");
    const surahId = surah.id.toString();

    return (
      normalizedName.includes(normalizedSearchText) ||
      surahId.includes(normalizedSearchText)
    );
  });

  // Add this function to handle surah search specifically
  const handleSurahSearch = (e) => {
    const input = e.target.value.toLowerCase();
    setSurahSearchText(input);
  };

  useEffect(() => {
    // Handle when a specific reciter is passed as parameter
    if (Reciter && reciters.length > 0 && !reciter) {
      const selectedReciter = reciters.find((r) => r.id.toString() === Reciter);
      if (selectedReciter) {
        setReciter(selectedReciter);
        if (selectedReciter.moshaf.length === 1) {
          setSelectedMoshaf(selectedReciter.moshaf[0]);
          updateAudioState({ selectedMoshaf: selectedReciter.moshaf[0] });
          console.log("Auto-selected moshaf:", selectedReciter.moshaf[0]);
        }
      }
    }
  }, [Reciter, reciters, reciter, updateAudioState]);

  return (
    <div
      className={`pt-8 bg-transparent text-text min-h-screen transition-all fadeIn ${currentPage === "quran-audio" && !collapsed ? "w-[calc(100%-11rem)] me-auto" : "w-full"}`}
    >
      <div className="flex flex-col items-start justify-center pb-4 px-2 gap-4">
          {(currentPage !== "quran-audio" || currentPage === "playlist-view") && (
          <button
            className={`flex flex-row w-fit items-center gap-2 mt-4 me-auto px-4 relative z-50 text-${window.api.getColor()}-500`}
            onClick={() => {
              if (currentPage === "playlist-view") {
                clearPlaylist();
                setCurrentPage("quran-audio");
              } else {
                setCurrentPage("quran-audio");
              }
            }}
          >
            {i18n.language === "ar" ? (
              <IconChevronRight />
            ) : (
              <IconChevronLeft />
            )}
            <h1 className={`text-base font-medium`}>{t("return")}</h1>
          </button>
        )}
        <h1 className={`text-3xl font-medium text-start px-4`}>
          {currentPlaylist ? currentPlaylist.name : reciter ? reciter.name : t("audio_quran")}
          <span className="text-base text-text-2 ps-2">
            {" "}
            {currentPlaylist ? `${currentPlaylist.surahs.length} ${t('surahs')}` : selectedMoshaf && selectedMoshaf.name}
          </span>
        </h1>
      </div>
      {!reciter && currentPage !== "playlist-view" ? (
        <div className={`flex flex-row-reverse h-full`}>
          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col px-8`}>
          {!reciter && (
            <p
              className={`text-lg font-medium text-text-2 text-start pb-4 pt-2`}
            >
              {t("select_reciter")}
            </p>
          )}
          <SearchBar searchText={searchText} onSearch={handleSearch} />
          {reciters.length === 0 ? (
            <Loading />
          ) : (
            <>
              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}
              {searchText && searchResults.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center mt-4`}
                >
                  <p className={`text-xl font-medium text-text-2 text-start`}>
                    {t("no_results")}
                  </p>
                </div>
              ) : (
                <>
                  {favorites.size > 0 && (
                    <>
                      <p
                        className={`text-xl flex items-center justify-start font-medium text-text-2 text-start mt-4 gap-2`}
                      >
                        <IconBookmarkFilled size={24} />
                        {t("favorite_reciters")}
                      </p>
                      <div
                        ref={recitersListRef}
                        className={`grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4 m-auto justify-center mt-4 w-full`}
                      >
                        {displayedReciters
                          .filter((reciter) => favorites.has(reciter.id))
                          .map((reciter) => (
                            <ReciterCard
                              key={reciter.id}
                              reciter={reciter}
                              isFavorite={favorites.has(reciter.id)}
                              onSelect={handleSelectReciter}
                              onToggleFavorite={handleToggleFavorite}
                              color={getColor}
                            />
                          ))}
                      </div>
                      <div className={`my-4 bg-bg-color-3 h-px w-full`} />
                    </>
                  )}
                  <div
                    ref={recitersListRef}
                    className={`grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4 m-auto justify-center w-full`}
                  >
                    {displayedReciters
                      .slice(0, hasMoreReciters)
                      .filter((reciter) => !favorites.has(reciter.id))
                      .map((reciter) => (
                        <ReciterCard
                          key={reciter.id}
                          reciter={reciter}
                          isFavorite={favorites.has(reciter.id)}
                          onSelect={handleSelectReciter}
                          onToggleFavorite={handleToggleFavorite}
                          color={getColor}
                        />
                      ))}
                  </div>
                  <button
                    onClick={scrollToTop}
                    className={`fixed bottom-4 right-20 bg-${window.api.getColor()}-900 border border-${window.api.getColor()}-600 text-${window.api.getColor()}-500 p-1 rounded-full shadow-lg transition-all z-50 ${
                      showScrollTop ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <IconArrowUp size={24} />
                  </button>
                </>
              )}
              {displayedReciters.length > 15 && (
                <button
                  className={`w-fit m-auto bg-bg-color-2 rounded-lg px-4 py-2 mt-2 text-text text-center`}
                  onClick={() => setShowMoreReciters(!showMoreReciters)}
                >
                  {showMoreReciters ? t("show_less") : t("show_all")}
                </button>
              )}
            </>
          )}

          </div>

          {/* Playlists Sidebar */}
          <div className={`${collapsed ? 'w-0' : 'w-48'} fixed end-0 top-10 h-screen bg-bg-color-2 border-l border-bg-color-3 flex flex-col ${t('language_code') === 'ar' ? 'order-first border-l-0 border-r' : ''}`}>
            {/* Sidebar Header */}
            {/* button to collapse the sidebar */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`pe-2 py-2 absolute bg-bg-color-2 rounded-full top-1/2 ${collapsed ? '-end-2' : 'start-2'} transition-all text-${window.api.getColor()}-500 hover:bg-${window.api.getColor()}-600`}
            >
              {collapsed ? <IconChevronRight size={24} /> : <IconChevronLeft size={24} />}
            </button>
            <div className="p-4 border-b border-bg-color-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-text">{t('playlists')}</h2>
                <button
                  onClick={() => {
                    setEditingPlaylist(null);
                    setIsModalOpen(true);
                  }}
                  className={`p-2 rounded-full bg-bg-color-3 text-${window.api.getColor()}-500 hover:bg-${window.api.getColor()}-600 transition-colors`}
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>

            {/* Playlists List */}
            <div className="flex-1 overflow-y-auto">
              {playlists.length === 0 ? (
                <div className="p-4 text-center text-text-2">
                  <IconPlaylist size={32} className="mx-auto mb-3 text-text-2" />
                  <p className="text-sm mb-1">{t('no_playlists')}</p>
                  <p className="text-xs">{t('create_your_first_playlist')}</p>
                </div>
              ) : (
                <div className="p-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="group relative flex items-center gap-3 p-3 rounded-lg hover:bg-bg-color-3 transition-colors cursor-pointer"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      {/* Playlist Icon */}
                      <div className={`w-12 h-12 bg-${window.api.getColor()}-500/50 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {/* index of playlist */}
                      {playlists.indexOf(playlist) + 1}
                      </div>

                      {/* Playlist Info */}
                      <div className="flex-1 w-full text-start truncate">
                        <h3 className="font-medium text-text truncate" title={playlist.name}>
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-text-2 w-max">
                          {playlist.surahs.length} {t('surahs')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex absolute end-2 bottom-3 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPlaylist(playlist);
                          }}
                          className="p-1 rounded-full text-text-2 hover:text-text hover:bg-bg-color-3 transition-colors"
                          title={t('edit_playlist')}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlaylist(playlist.id);
                          }}
                          className="p-1 rounded-full text-red-500 hover:bg-red-500/20 transition-colors"
                          title={t('delete_playlist')}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : currentPage === "playlist-view" ? (
        <div className={`px-8`}>
          <div className="flex flex-col gap-4">
            <SearchBar
              searchText={surahSearchText}
              onSearch={handleSurahSearch}
            />
            {currentPlaylist && currentPlaylist.surahs.length === 0 ? (
              <div className={`flex flex-col items-center justify-center mt-4 gap-4 min-h-[70vh] text-text-2 opacity-50`}>
                <IconPlaylist size={64} />
                <p className={`text-xl font-medium text-center`}>
                  {t('no_surahs_in_playlist')}
                </p>
                <p className={`text-base text-center`}>
                  {t('add_surahs_to_playlist')}
                </p>
              </div>
            ) : (
              <div
                ref={surahsListRef}
                className={`grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4 m-auto justify-center mt-4 w-full`}
              >
                {currentPlaylist && currentPlaylist.surahs
                  .filter((surah) =>
                    surah.name.toLowerCase().includes(surahSearchText.toLowerCase())
                  )
                  .map((surah) => (
                    <SurahCard
                      key={surah.id}
                      id={`playlist-surah-${surah.id}`}
                      surah={surah}
                      color={getColor()}
                      onSelect={() => handleSelectPlaylistSurah(surah)}
                      currentSurah={audioState.surahName}
                      currentReciterId={audioState.reciterId}
                      isPlaying={audioState.isPlaying}
                      reciterId={surah.reciterId}
                      onRemoveFromPlaylist={(reciterId) => removeSurahFromPlaylist(currentPlaylist.id, surah.id, reciterId)}
                      showRemoveButton={true}
                    />
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
      ) : (
        <div className={`px-8`}>
          {reciter.moshaf.length > 1 && !selectedMoshaf ? (
            <MoshafSelector
              moshafs={reciter.moshaf}
              onSelect={handleSelectMoshaf}
            />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <p className={`text-lg font-medium text-text-2 text-start`}>
                  {t("select_surah")}
                </p>
                <SearchBar
                  searchText={surahSearchText}
                  onSearch={handleSurahSearch}
                />
              </div>
              {isOnline ? (
                <div
                  ref={surahsListRef}
                  className={`grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4 m-auto justify-center mt-2 w-full`}
                >
                  {filteredSurahs
                    .filter((surah) =>
                      reciter.moshaf
                        .find((m) => m.id === selectedMoshaf?.id)
                        ?.surah_list.split(",")
                        .includes(surah.id.toString())
                    )
                    .map((surah) => (
                      <SurahCard
                        key={surah.id}
                        id={`surah-${surah.id}`}
                        surah={surah}
                        color={getColor()}
                        onSelect={() => handleSelectSurah(surah.id)}
                        currentSurah={audioState.surahName}
                        currentReciterId={audioState.reciterId}
                        isPlaying={audioState.isPlaying}
                        reciterId={reciter?.id}
                        onAddToPlaylist={(e, surah) => handleSurahRightClick(e, surah)}
                        playlists={playlists}
                      />
                    ))}
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center mt-4 gap-4 min-h-[70vh] text-text-2 opacity-50`}
                >
                  <IconWorldOff size={128} stroke={1.5} />
                  <p className={`text-xl font-medium text-start`}>
                    {t("no_internet")}
                  </p>
                </div>
              )}
              <button
                onClick={scrollToTop}
                className={`fixed bottom-4 right-20 bg-${window.api.getColor()}-900 border border-${window.api.getColor()}-600 text-${window.api.getColor()}-500 p-1 rounded-full shadow-lg transition-all z-50 ${
                  showScrollTop ? "opacity-100" : "opacity-0"
                }`}
              >
                <IconArrowUp size={24} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlaylist(null);
        }}
        onSubmit={handleModalSubmit}
        playlist={editingPlaylist}
      />

      {/* Playlist Context Menu */}
      <PlaylistContextMenu
        isOpen={playlistContextMenu.isOpen}
        position={playlistContextMenu.position}
        onClose={closePlaylistContextMenu}
        surah={playlistContextMenu.surah}
        onAddToPlaylist={handleAddToPlaylist}
        playlists={playlists}
        currentReciterId={reciter?.id}
      />
    </div>
  );
}

export default AudioQuran;
