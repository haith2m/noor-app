/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

import Header from "./components/Home/Header";
import Home from "./components/Home/Home";
import Sidebar from "./components/Sidebar";
import Azkar from "./components/Azkar/Azkar";
import Loading from "./components/Loading";
import Settings from "./components/Settings";
import { PageProvider, usePage } from "./PageContext";
import TitleBar from "./components/TitleBar";
import AzkarCategories from "./components/Azkar/AzkarCategories";
import Calendar from "./components/Calendar/Calendar";
import SoundPlayer from "./components/SoundPlayer";
import UpdateNotification from "./components/UpdateNotification";
import AudioPlayer from "./components/AudioQuran/AudioPlayer";
import {
  IconCloud,
  IconMoon,
  IconSun,
  IconSunrise,
  IconSunset,
} from "@tabler/icons-react";
import AudioQuran from "./components/AudioQuran/AudioQuran";
import Quran from "./components/Quran/Quran";

function MainApp() {
  const { t, i18n } = useTranslation();
  const { currentPage, settings, audioState } = usePage();
  const [data, setData] = useState(null);
  const [prayers, setPrayers] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const calculatePrayerTimes = () => {
    const coordinates = new Coordinates(data.latitude, data.longitude) || null;
    const method =
      CalculationMethod[settings.calculationMethod || "UmmAlQura"]();
    const date = new Date();
    const prayerTimes = new PrayerTimes(coordinates, date, method);

    // Get prayer time corrections from settings
    const corrections = settings.prayerTimeCorrections || {};

    // Helper function to apply corrections to a prayer time
    const applyCorrectionToTime = (time, prayerName) => {
      if (corrections[prayerName]) {
        const correctedTime = new Date(time);
        correctedTime.setMinutes(correctedTime.getMinutes() + corrections[prayerName]);
        return correctedTime;
      }
      return time;
    };

    const currentPrayer =
      prayerTimes.currentPrayer() === "none" ||
      prayerTimes.currentPrayer() === "sunrise"
        ? "fajr"
        : prayerTimes.currentPrayer();

    // Get the next prayer, skipping sunrise and none
    let nextPrayer = prayerTimes.nextPrayer();
    if (nextPrayer === "none" || nextPrayer === "sunrise") {
      // If next prayer is sunrise or none, get the next prayer
      const fivePrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      const currentIndex = fivePrayers.indexOf(currentPrayer);
      nextPrayer = fivePrayers[(currentIndex + 1) % fivePrayers.length];
    }
    
    // Apply corrections to next prayer time
    const nextPrayerTime = applyCorrectionToTime(prayerTimes.timeForPrayer(nextPrayer), nextPrayer);

    // Filter out sunrise and none from prayer times and format the data to be used in the Home component
    const filteredTimes = {
      fajr: {
        time: applyCorrectionToTime(prayerTimes.fajr, "fajr"),
        nawafil: {
          before: 2,
          after: 0,
        },
        icon: (
          <IconSunrise
            size={24}
            className={`text-${window.api.getColor()}-500`}
          />
        ),
      },
      dhuhr: {
        time: applyCorrectionToTime(prayerTimes.dhuhr, "dhuhr"),
        nawafil: {
          before: 4,
          after: 2,
        },
        icon: (
          <IconSun size={24} className={`text-${window.api.getColor()}-500`} />
        ),
      },
      asr: {
        time: applyCorrectionToTime(prayerTimes.asr, "asr"),
        nawafil: {
          before: 0,
          after: 0,
        },
        icon: (
          <IconCloud
            size={24}
            className={`text-${window.api.getColor()}-500`}
          />
        ),
      },
      maghrib: {
        time: applyCorrectionToTime(prayerTimes.maghrib, "maghrib"),
        nawafil: {
          before: 0,
          after: 2,
        },
        icon: (
          <IconSunset
            size={24}
            className={`text-${window.api.getColor()}-500`}
          />
        ),
      },
      isha: {
        time: applyCorrectionToTime(prayerTimes.isha, "isha"),
        nawafil: {
          before: 0,
          after: 2,
        },
        icon: (
          <IconMoon size={24} className={`text-${window.api.getColor()}-500`} />
        ),
      },
    };

    return {
      times: filteredTimes,
      currentPrayer: currentPrayer === "sunrise" ? "fajr" : currentPrayer,
      nextPrayer,
      nextPrayerTime,
    };
  };

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const locationData = await window.api.getLocationData();
        setData(locationData);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();

    document.title = `${t("noor")} - ${t(
      currentPage.startsWith("quran-audio")
        ? "audio_quran"
        : currentPage.startsWith("azkar-")
        ? "azkar"
        : currentPage
    )}`;
    console.log(
      `setting title to ${t("noor")} - ${t(
        currentPage.startsWith("quran-audio")
          ? "audio_quran"
          : currentPage.startsWith("azkar-")
          ? "azkar"
          : currentPage
      )}`,
      t
    );
  }, [i18n.language, currentPage, t]);

  useEffect(() => {
    if (data) {
      setPrayers(calculatePrayerTimes());
    }
  }, [data, settings]);

  useEffect(() => {
    window.api.receive("reload-prayers", () => {
      setPrayers(calculatePrayerTimes());
    });

    return () => {
      window.api.removeListener("reload-prayers");
    };
  }, []);

  setInterval(() => {
    setPrayers(calculatePrayerTimes());
  }, 1000 * 60 * 60);

  // Add keyboard shortcut listener for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open search with Ctrl+K or Command+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!data || !prayers) {
    return (
      <div className={`flex items-center justify-center min-h-screen `}>
        <Loading />
      </div>
    );
  }

  const renderContent = () => {
    return (
      <>
        <Sidebar />
        <TitleBar onOpenSearch={() => setSearchOpen(true)} />
        <div
          className={`w-[calc(100%-4rem)] ms-auto mt-10 transition-all duration-300 ${
            audioState.audioUrl ? "pb-24" : ""
          }`}
        >
          {currentPage === "home" && (
            <>
              <Header location={data} prayersData={prayers} />
              <Home prayersData={prayers} />
            </>
          )}
          {currentPage.startsWith("quran-audio-") && (
            <AudioQuran
              Reciter={currentPage.split("-")[2]}
              Surah={currentPage.split("-")[2] || null}
            />
          )}
          {(currentPage === "quran-audio" || currentPage === "playlist-view") && <AudioQuran />}
          {currentPage.startsWith("azkar-") && (
            <Azkar category={currentPage.split("-")[1]} />
          )}
          {currentPage === "quran" && <Quran />}
          {currentPage === "azkar" && <AzkarCategories />}
          {currentPage.startsWith("settings") && <Settings />}
          {currentPage === "calendar" && <Calendar />}
        </div>
      </>
    );
  };

  return (
    <div className={`App flex relative transition-all`}>{renderContent()}</div>
  );
}

function App() {
  return (
    <PageProvider>
      <MainApp />
      <SoundPlayer />
      <UpdateNotification />
      <AudioPlayer />
    </PageProvider>
  );
}

export default App;
