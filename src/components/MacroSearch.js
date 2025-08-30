import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "../PageContext";
import {
  IconSearch,
  IconX,
  IconChevronRight,
  IconSettings,
  IconBook,
  IconChevronLeft,
  IconHome,
  IconCalendar,
  IconHeadphones,
} from "@tabler/icons-react";
import AzkarIcon from "./AzkarIcon";
import { compatibleAPI } from "../utils/webCompatibility";

function MacroSearch({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { setCurrentPage, currentPage } = usePage();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [reciters, setReciters] = useState([]);
  const [suwar, setSuwar] = useState([]);
  const [azkarCategories, setAzkarCategories] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const language = compatibleAPI.getSettings().language || "ar";

    // Load reciters
    fetch(`${process.env.PUBLIC_URL}/reciters-${language}.json`)
      .then((res) => res.json())
      .then(
        (result) => {
          setReciters(result.reciters);
        },
        (error) => {
          console.error("Failed to load reciters:", error);
        }
      );

    // Load surahs
    fetch(`${process.env.PUBLIC_URL}/suwar-${language}.json`)
      .then((res) => res.json())
      .then(
        (result) => {
          setSuwar(result.suwar);
        },
        (error) => {
          console.error("Failed to load suwar:", error);
        }
      );

    // Load azkar categories
    const fetchAzkar = async () => {
      try {
        const azkarPath = await compatibleAPI.getResourcePath("azkar.json");
        const response = await fetch(azkarPath);
        const data = await response.json();
        setAzkarCategories(data);
      } catch (error) {
        console.error("Failed to load azkar categories:", error);
      }
    };

    fetchAzkar();

    // Focus the input when the search is opened
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search input changes
  const handleSearch = (e) => {
    const input = e.target.value.toLowerCase();
    setSearchText(input);
    setSelectedIndex(-1);

    if (input === "") {
      setSearchResults([]);
      return;
    }

    const results = [];
    const normalizedInput = input.replace(/[أإآ]/g, "ا");

    const pages = [
      {
        id: "home",
        name: t("home"),
        page: "home",
        icon: <IconHome size={20} />,
      },
      {
        id: "audio_quran",
        name: t("audio_quran"),
        page: "quran-audio",
        icon: <IconHeadphones size={20} />,
      },
      {
        id: "azkar",
        name: t("azkar"),
        page: "azkar",
        icon: <AzkarIcon filled={false} color={"text-text"} size={24} />,
      },
      {
        id: "calendar",
        name: t("calendar"),
        page: "calendar",
        icon: <IconCalendar size={20} />,
      },
      {
        id: "settings",
        name: t("settings"),
        page: "settings",
        icon: <IconSettings size={20} />,
      },
    ];

    // Search pages
    pages.forEach((page) => {
      const normalizedName = page.name.toLowerCase().replace(/[أإآ]/g, "ا");
      if (normalizedName.includes(normalizedInput)) {
        results.push({
          type: "page",
          id: page.id,
          name: page.name,
          page: page.page,
          icon: page.icon,
        });
      }
    });

    // Search reciters
    reciters.forEach((reciter) => {
      const normalizedName = reciter.name.toLowerCase().replace(/[أإآ]/g, "ا");
      if (normalizedName.includes(normalizedInput)) {
        results.push({
          type: "reciter",
          id: reciter.id,
          name: reciter.name,
          page: `quran-${reciter.id}`,
          icon: <IconBook size={20} />,
        });
      }
    });

    // Search surahs
    suwar.forEach((surah) => {
      const normalizedName = surah.name.toLowerCase().replace(/[أإآ]/g, "ا");
      if (normalizedName.includes(normalizedInput)) {
        results.push({
          type: "surah",
          id: surah.id,
          name: surah.name,
          page: `quran`,
          highlight: surah.id,
          icon: <IconBook size={20} />,
        });
      }
    });

    // Search azkar categories
    Object.keys(azkarCategories).forEach((category) => {
      const normalizedName = t(category).toLowerCase().replace(/[أإآ]/g, "ا");
      if (normalizedName.includes(normalizedInput)) {
        results.push({
          type: "azkar",
          id: category,
          name: t(category),
          page: `azkar-${category}`,
          icon: <AzkarIcon filled={false} color={"text-text"} size={24} />,
        });
      }
    });

    // Search settings (hardcoded settings options)
    const settings = [
      { id: "language", name: t("language") },
      { id: "theme", name: t("theme") },
      { id: "color", name: t("color") },
      { id: "adhan_notifications", name: t("adhan_notifications") },
      { id: "calculationMethod", name: t("calculation_method") },
    ];

    settings.forEach((setting) => {
      const normalizedName = setting.name.toLowerCase().replace(/[أإآ]/g, "ا");
      if (normalizedName.includes(normalizedInput)) {
        results.push({
          type: "setting",
          id: setting.id,
          name: setting.name,
          page: "settings",
          highlight: setting.id,
          icon: <IconSettings size={20} />,
        });
      }
    });

    setSearchResults(results);
  };

  const handleResultClick = (result) => {
    if (result.type === "surah") {
      // For surahs, we need to store more persistent information
      const persistentHighlight = {
        type: "surah",
        id: result.highlight,
        timestamp: Date.now(),
      };
      // Store as JSON string to keep the type information
      localStorage.setItem(
        "persistentHighlight",
        JSON.stringify(persistentHighlight)
      );

      // If we're not already on the Quran page, navigate there
      if (currentPage !== "quran-audio" && !currentPage.startsWith("quran-audio")) {
        setCurrentPage("quran-audio");
      } else {
        // If already on Quran page or reciter page, just set the highlight to work now
        localStorage.setItem("highlight", result.highlight);
        localStorage.setItem("scrollToSurah", "true");
      }
    } else {
      // For other types, continue with the existing logic
      setCurrentPage(result.page);
      if (result.highlight) {
        localStorage.setItem("highlight", result.highlight);
        if (result.type === "surah") {
          localStorage.setItem("scrollToSurah", "true");
        }
      }
    }
    onClose();
  };

  // Handle keyboard navigation - only for Enter key now
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0 && selectedIndex >= 0) {
      handleResultClick(searchResults[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh] transition-all">
      <div className="w-[600px] max-w-[90vw] bg-bg-color-2 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center p-4 border-b border-bg-color-3 gap-2">
          <IconSearch className="text-text-2 mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t("search_placeholder")}
            className="w-full bg-transparent border-none outline-none text-text"
            value={searchText}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            onClick={onClose}
            className="ml-2 text-text-2 hover:text-text"
          >
            <IconX size={20} />
          </button>
        </div>

        {searchResults.length > 0 ? (
          <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={`${result.type}-${result.id}`}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-bg-color-3 transition-colors ${
                  index === selectedIndex
                    ? `bg-${compatibleAPI.getColor()}-500/10`
                    : ""
                }`}
                onClick={() => handleResultClick(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseLeave={() => setSelectedIndex(-1)}
              >
                <div className={`text-${compatibleAPI.getColor()}-500`}>
                  {result.icon}
                </div>
                <div className="flex-1 text-start">
                  <div className="font-medium text-text">{result.name}</div>
                  <div className="text-sm text-text-2">
                    {t(result.type)}
                    {result.type === "surah" && ` - ${t("surah")} ${result.id}`}
                  </div>
                </div>
                {i18n.language === "ar" ? (
                  <IconChevronLeft
                    size={24}
                    className={`text-${compatibleAPI.getColor()}-500`}
                  />
                ) : (
                  <IconChevronRight
                    size={24}
                    className={`text-${compatibleAPI.getColor()}-500`}
                  />
                )}
              </div>
            ))}
          </div>
        ) : searchText ? (
          <div className="p-4 text-center text-text-2">{t("no_results")}</div>
        ) : null}
      </div>
    </div>
  );
}

export default MacroSearch;
