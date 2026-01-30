/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Coordinates, CalculationMethod, Madhab, PrayerTimes } from "adhan";

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
import Widgets from "./components/Widgets/Widgets";
import {
  IconCloud,
  IconMoon,
  IconSun,
  IconSunrise,
  IconSunset,
} from "@tabler/icons-react";
import AudioLayout from "./components/AudioQuran/AudioLayout";
import Quran from "./components/Quran/Quran";
import DesktopOverlay from "./components/Widgets/DesktopOverlay";
import DesktopWidgets from "./components/Widgets/DesktopWidgets";

function MainApp() {
  const { t, i18n } = useTranslation();
  const { currentPage, settings, audioState } = usePage();
  const [data, setData] = useState(null);
  const [prayers, setPrayers] = useState(null);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isWidgetsMode, setIsWidgetsMode] = useState(false);
  const [overlayWidget, setOverlayWidget] = useState(null);

  // Check if we're in overlay mode or widgets mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const overlay = urlParams.get("overlay");
    const widgets = urlParams.get("widgets");
    const widgetParam = urlParams.get("widget");

    console.log("App mode check:", { overlay, widgets, widgetParam });

    if (overlay === "true" && widgetParam) {
      try {
        const widget = JSON.parse(decodeURIComponent(widgetParam));
        setIsOverlayMode(true);
        setOverlayWidget(widget);
        // Make body transparent for overlay
        document.body.style.backgroundColor = "transparent";
        document.documentElement.style.backgroundColor = "transparent";
      } catch (error) {
        console.error("Error parsing widget data:", error);
      }
    } else if (widgets === "true") {
      console.log("Widgets mode detected!");
      setIsWidgetsMode(true);
      // Make body transparent for widgets
      document.body.style.backgroundColor = "transparent";
      document.documentElement.style.backgroundColor = "transparent";
      document.body.style.overflow = "hidden";
    }
  }, []);

  const calculatePrayerTimes = () => {
    const coordinates = new Coordinates(data.latitude, data.longitude) || null;
    const params =
      CalculationMethod[settings.calculationMethod || "UmmAlQura"]();
    params.madhab =
      settings.asrCalculationMethod === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;

    const calculationMethod = settings.calculationMethod || "UmmAlQura";
    const shafiParams = CalculationMethod[calculationMethod]();
    shafiParams.madhab = Madhab.Shafi;

    const hanafiParams = CalculationMethod[calculationMethod]();
    hanafiParams.madhab = Madhab.Hanafi;

    const date = new Date();
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    // Get prayer time corrections from settings
    const corrections = settings.prayerTimeCorrections || {};

    // Helper function to apply corrections to a prayer time
    const applyCorrectionToTime = (time, prayerName) => {
      if (corrections[prayerName]) {
        const correctedTime = new Date(time);
        correctedTime.setMinutes(
          correctedTime.getMinutes() + corrections[prayerName]
        );
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
    const nextPrayerTime = applyCorrectionToTime(
      prayerTimes.timeForPrayer(nextPrayer),
      nextPrayer
    );

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

    // Create asr settings with corrections applied
    const hanafiAsrTimes = new PrayerTimes(coordinates, date, hanafiParams);
    const shafiAsrTimes = new PrayerTimes(coordinates, date, shafiParams);
    
    return {
      times: filteredTimes,
      currentPrayer: currentPrayer === "sunrise" ? "fajr" : currentPrayer,
      nextPrayer,
      nextPrayerTime,
      asrSettings: {
        hanafiAsr: {
          asr: applyCorrectionToTime(hanafiAsrTimes.asr, "asr"),
        },
        shafiAsr: {
          asr: applyCorrectionToTime(shafiAsrTimes.asr, "asr"),
        },
      },
    };
  };

  useEffect(() => {
    // Skip data loading if in widgets or overlay mode
    if (isWidgetsMode || isOverlayMode) {
      return;
    }

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
    // Skip prayer calculation if in widgets or overlay mode
    if (isWidgetsMode || isOverlayMode) {
      return;
    }

    if (data) {
      setPrayers(calculatePrayerTimes());
    }
  }, [data, settings, isWidgetsMode, isOverlayMode]);

  useEffect(() => {
    window.api.receive("reload-prayers", () => {
      setPrayers(calculatePrayerTimes());
    });

    return () => {
      window.api.removeListener("reload-prayers");
    };
  }, []);

  setInterval(
    () => {
      setPrayers(calculatePrayerTimes());
    },
    1000 * 60 * 60
  );

  // If in widgets mode, show only the widgets
  if (isWidgetsMode) {
    console.log("App: Rendering DesktopWidgets component");
    return <DesktopWidgets />;
  }

  // If in overlay mode, show only the overlay
  if (isOverlayMode && overlayWidget) {
    return (
      <DesktopOverlay
        widget={overlayWidget}
        onPlace={(position) => {
          window.api.sendWidgetPosition(position);
        }}
        onCancel={async () => {
          await window.api.closeDesktopOverlay();
        }}
        isDesktopOverlay={true}
      />
    );
  }

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
        <TitleBar />
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
          {(currentPage.startsWith("quran-audio") ||
            currentPage.startsWith("playlist-")) && (
            <AudioLayout key="audio-layout" />
          )}
          {currentPage.startsWith("azkar-") && (
            <Azkar category={currentPage.split("-")[1]} />
          )}
          {currentPage === "quran" && <Quran />}
          {currentPage === "azkar" && <AzkarCategories />}
          {currentPage.startsWith("settings") && <Settings />}
          {currentPage === "calendar" && <Calendar />}
          {currentPage === "widgets" && <Widgets />}
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
