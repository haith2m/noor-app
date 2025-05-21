/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
// src/components/Quran/Quran.jsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";
import ReciterCard from "./ReciterCard";
import SurahCard from "./SurahCard";
import SearchBar from "./SearchBar";
import { usePage } from "../../PageContext";
import AudioPlayer from "./AudioPlayer";
import MoshafSelector from "./MoshafSelector";
import {
  IconBookmarkFilled,
  IconChevronLeft,
  IconChevronRight,
  IconWorldOff,
  IconArrowUp,
} from "@tabler/icons-react";

function Quran({ Reciter }) {
  const { t, i18n } = useTranslation();
  const [reciter, setReciter] = useState();
  const [reciters, setReciters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [suwar, setSuwar] = useState([]);
  const [showMoreReciters, setShowMoreReciters] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentSurah, setCurrentSurah] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [error, setError] = useState(null);
  const [selectedMoshaf, setSelectedMoshaf] = useState(null);
  const [autoplay, setAutoplay] = useState(
    localStorage.getItem("autoplay") === "true"
  );
  const [repeat, setRepeat] = useState(
    localStorage.getItem("repeat") === "true"
  );
  const [surahSearchText, setSurahSearchText] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const recitersListRef = useRef(null);
  const surahsListRef = useRef(null);

  const audioRef = useRef(null);

  const { currentPage, setCurrentPage } = usePage();

  useEffect(() => {
    const language = window.api.getSettings().language === "ar" ? "ar" : "en";

    fetch(`${process.env.PUBLIC_URL}/suwar-${language}.json`)
      .then((res) => res.json())
      .then(
        (result) => {
          setSuwar(result.suwar);

          // Check if there's a surah to highlight from search immediately
          // For pages that already loaded with a reciter and moshaf
          const highlightedSurahId = localStorage.getItem("highlight");
          const shouldScrollToSurah = localStorage.getItem("scrollToSurah");

          if (
            reciter &&
            selectedMoshaf &&
            highlightedSurahId &&
            shouldScrollToSurah
          ) {
            // We need to wait for the surah list to render
            setTimeout(() => {
              const surahElement = document.getElementById(
                `surah-${highlightedSurahId}`
              );
              if (surahElement) {
                surahElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                // Add a temporary highlight class
                surahElement.classList.add(
                  `bg-${window.api.getColor()}-500/20`
                );
                setTimeout(() => {
                  surahElement.classList.remove(
                    `bg-${window.api.getColor()}-500/20`
                  );
                }, 2000);
              }
              // Clear the highlight after using it
              localStorage.removeItem("highlight");
              localStorage.removeItem("scrollToSurah");
            }, 500);
          }
        },
        (error) => {
          setError(t("failed_to_load_suwar"));
        }
      );

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
          setError(t("failed_to_load_reciters"));
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
    if (currentSurah === selectedSurah.name && isPlaying) {
      setIsPlaying(!isPlaying);
      audioRef.current.pause();
    } else {
      if (selectedSurah && reciter && selectedMoshaf) {
        const url = `${selectedMoshaf.server}${pad(selectedSurah.id, 3)}.mp3`;
        setAudioUrl(url);
        setCurrentSurah(selectedSurah.name);
        setIsPlaying(true);
        audioRef.current?.play();
      }
    }
  };

  const handleSelectMoshaf = (moshaf) => {
    setSelectedMoshaf(moshaf);
    setAudioUrl(null);
    setCurrentSurah("");
  };

  const handleSelectReciter = (reciter) => {
    setReciter(reciter);
    setCurrentPage(`quran-${reciter.id}`);

    if (reciter.moshaf.length > 1) {
      setSelectedMoshaf(null);
    } else if (reciter.moshaf.length === 1) {
      setSelectedMoshaf(reciter.moshaf[0]);
    }
  };

  const handleOnEnded = () => {
    if (repeat) {
      audioRef.current.currentTime = 0;
    } else if (autoplay) {
      const nextSurah =
        suwar[suwar.findIndex((s) => s.name === currentSurah) + 1];
      if (nextSurah) {
        setAudioUrl(`${selectedMoshaf.server}${pad(nextSurah.id, 3)}.mp3`);
        setCurrentSurah(nextSurah.name);
      }
    } else {
      setIsPlaying(false);
      audioRef.current?.pause();
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

  const filteredSurahs = suwar.filter((surah) => {
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

  // Add this useEffect to handle persistent highlight for surah selection
  useEffect(() => {
    // When a reciter and moshaf are selected, check if we have a persistent highlight
    if (reciter && selectedMoshaf) {
      try {
        const persistentHighlightStr = localStorage.getItem(
          "persistentHighlight"
        );
        if (persistentHighlightStr) {
          const persistentHighlight = JSON.parse(persistentHighlightStr);

          // Check if it's still relevant (less than 5 minutes old)
          const now = Date.now();
          const timestamp = persistentHighlight.timestamp || 0;
          const isRecent = now - timestamp < 5 * 60 * 1000; // 5 minutes

          if (isRecent && persistentHighlight.type === "surah") {
            const surahId = persistentHighlight.id;
            const selectedSurah = suwar.find((s) => s.id == surahId);

            if (selectedSurah) {
              // Only proceed if this surah is available in the selected moshaf
              const isSurahAvailable = reciter.moshaf
                .find((m) => m.id === selectedMoshaf.id)
                ?.surah_list.split(",")
                .includes(surahId.toString());

              if (isSurahAvailable) {
                // Set up the highlight
                setTimeout(() => {
                  const surahElement = document.getElementById(
                    `surah-${surahId}`
                  );
                  if (surahElement) {
                    surahElement.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                    surahElement.classList.add(
                      `bg-${window.api.getColor()}-500/20`
                    );
                    setTimeout(() => {
                      surahElement.classList.remove(
                        `bg-${window.api.getColor()}-500/20`
                      );
                    }, 2000);
                  }

                  // Clear the persistent highlight
                  localStorage.removeItem("persistentHighlight");
                }, 500);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing persistent highlight:", error);
        localStorage.removeItem("persistentHighlight");
      }
    }
  }, [reciter, selectedMoshaf, suwar]);

  // Add this function to handle surah search specifically
  const handleSurahSearch = (e) => {
    const input = e.target.value.toLowerCase();
    setSurahSearchText(input);
  };

  // Add a useEffect to handle scrollToSurah localStorage changes
  useEffect(() => {
    const scrollToHighlightedSurah = () => {
      const highlightedSurahId = localStorage.getItem("highlight");
      const shouldScrollToSurah = localStorage.getItem("scrollToSurah");

      if (
        highlightedSurahId &&
        shouldScrollToSurah &&
        reciter &&
        selectedMoshaf
      ) {
        // We need to wait for the surah list to render
        setTimeout(() => {
          const surahElement = document.getElementById(
            `surah-${highlightedSurahId}`
          );
          if (surahElement) {
            surahElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            // Add a temporary highlight class
            surahElement.classList.add(`bg-${window.api.getColor()}-500/20`);
            setTimeout(() => {
              surahElement.classList.remove(
                `bg-${window.api.getColor()}-500/20`
              );
            }, 2000);
          }
          // Clear the highlight after using it
          localStorage.removeItem("highlight");
          localStorage.removeItem("scrollToSurah");
        }, 500);
      }
    };

    // Check on initial render and when reciter/moshaf changes
    scrollToHighlightedSurah();

    // Also listen for storage events which can be triggered by MacroSearch
    const handleStorageEvent = () => {
      scrollToHighlightedSurah();
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [reciter, selectedMoshaf]);

  return (
    <div
      className={`pt-8 bg-transparent text-text min-h-screen transition-all fadeIn ${
        audioUrl ? "pb-24" : "pb-4"
      }`}
    >
      <div className="flex flex-col items-start justify-center pb-4 px-2 gap-4">
        {currentPage !== "quran" && (
          <button
            className={`flex flex-row w-fit items-center gap-2 mt-4 me-auto px-4 relative z-50 text-${window.api.getColor()}-500`}
            onClick={() => setCurrentPage("quran")}
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
          {reciter ? reciter.name : t("quran")}
          <span className="text-base text-text-2 ps-2">
            {" "}
            {selectedMoshaf && selectedMoshaf.name}
          </span>
        </h1>
      </div>
      {!reciter ? (
        <div className={`flex flex-col h-full px-8`}>
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
              {navigator.onLine ? (
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
                        currentSurah={currentSurah}
                        isPlaying={isPlaying}
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

      {audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          surahName={currentSurah}
          reciterName={reciter?.name}
          reciterId={reciter?.id}
          server={selectedMoshaf?.server}
          surahId={
            currentSurah ? suwar.find((s) => s.name === currentSurah)?.id : null
          }
          autoplay={autoplay}
          setAutoplay={setAutoplay}
          repeat={repeat}
          setRepeat={setRepeat}
          handleOnEnded={handleOnEnded}
          audioElement={audioRef}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}
    </div>
  );
}

export default Quran;
