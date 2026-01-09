/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
// src/components/Quran/Quran.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";
import ReciterCard from "./ReciterCard";
import SurahCard from "../SurahCard";
import SearchBar from "./SearchBar";
import { usePage } from "../../PageContext";
import MoshafSelector from "./MoshafSelector";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import {
  IconBookmarkFilled,
  IconChevronLeft,
  IconChevronRight,
  IconWorldOff,
  IconArrowUp,
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
  const [playlistMenu, setPlaylistMenu] = useState(null); // { x, y, surah }
  const [surahToAdd, setSurahToAdd] = useState(null);

  const recitersListRef = useRef(null);
  const surahsListRef = useRef(null);

  const {
    currentPage,
    setCurrentPage,
    audioState,
    playAudio,
    togglePlayPause,
    setSuwarList,
    updateAudioState,
  } = usePage();

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

  const handleAddToPlaylist = (e, surah) => {
    e.stopPropagation();
    setSurahToAdd({
        surah,
        reciter: { id: reciter.id, name: reciter.name },
        moshaf: selectedMoshaf
    });
    setPlaylistMenu({ left: e.clientX, top: e.clientY });
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
      className={`pt-8 bg-transparent text-text min-h-screen transition-all fadeIn w-full`}
    >
      <div className="flex flex-col items-start justify-center pb-4 px-2 gap-4">
        {currentPage !== "quran-audio" && (
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
        )}
        <h1 className={`text-3xl font-medium text-start px-4`}>
          {reciter
            ? reciter.name
            : t("audio_quran")}
          <span className="text-base text-text-2 ps-2">
            {" "}
            {selectedMoshaf && selectedMoshaf.name}
          </span>
        </h1>
      </div>
      {!reciter ? (
        <div className={`flex flex-col h-full`}>
            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden`}>
            {/* Original Reciter List Content */}
            <div className="flex-1 flex flex-col px-8 overflow-y-auto pt-4">
            {!reciter && (
              <p
                className={`text-lg font-medium text-text-2 text-start pb-4 pt-2`}
              >
                {t("select_reciter")}
              </p>
            )}
            <div className="flex flex-row gap-2 w-full relative">
              <div className="flex-1">
                <SearchBar searchText={searchText} onSearch={handleSearch} />
              </div>
            </div>
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
          </div>
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
                <div className="flex flex-row gap-2 w-full">
                  <div className="flex-1">
                    <SearchBar
                      searchText={surahSearchText}
                      onSearch={handleSurahSearch}
                    />
                  </div>
                </div>
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
                        onAdd={(e) => handleAddToPlaylist(e, surah)}
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
      <AddToPlaylistMenu
          isOpen={!!playlistMenu}
          onClose={() => setPlaylistMenu(null)}
          surahToAdd={surahToAdd}
          position={playlistMenu}
      />
    </div>
  );
}

export default AudioQuran;
