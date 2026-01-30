import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  IconCheck,
  IconCircle,
} from "@tabler/icons-react";
import { usePage } from "../../PageContext";

function TodoList({ prayersData }) {
  const { t } = useTranslation();
  const { setCurrentPage } = usePage();
  const [adhkarProgress, setAdhkarProgress] = useState(0);
  const [quranRead, setQuranRead] = useState(false);
  const [adhkarType, setAdhkarType] = useState("morning"); // "morning" or "evening"
  const [prayersCompleted, setPrayersCompleted] = useState({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });

  // Determine if it's morning or evening based on prayer times
  useEffect(() => {
    if (!prayersData || !prayersData.times) return;

    const now = moment();
    // Handle both Date objects and time strings
    let fajrTime, asrTime;

    if (prayersData.times.fajr.time instanceof Date) {
      fajrTime = moment(prayersData.times.fajr.time);
    } else {
      fajrTime = moment(prayersData.times.fajr.time, "HH:mm");
      // Set today's date for time string
      fajrTime.set({ year: now.year(), month: now.month(), date: now.date() });
    }

    if (prayersData.times.asr.time instanceof Date) {
      asrTime = moment(prayersData.times.asr.time);
    } else {
      asrTime = moment(prayersData.times.asr.time, "HH:mm");
      // Set today's date for time string
      asrTime.set({ year: now.year(), month: now.month(), date: now.date() });
    }

    // Morning: after Fajr until Asr
    // Evening: after Asr until next Fajr
    if (now.isAfter(fajrTime) && now.isBefore(asrTime)) {
      setAdhkarType("morning");
    } else {
      setAdhkarType("evening");
    }
  }, [prayersData]);

  // Load saved progress from localStorage
  useEffect(() => {
    const today = moment().format("YYYY-MM-DD");
    const savedData = localStorage.getItem(`todo_${today}`);

    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setAdhkarProgress(data.adhkarProgress || 0);
        setQuranRead(data.quranRead || false);
        setPrayersCompleted(data.prayersCompleted || {
          fajr: false,
          dhuhr: false,
          asr: false,
          maghrib: false,
          isha: false,
        });
      } catch (error) {
        console.error("Error loading todo data:", error);
      }
    } else {
      // Reset for new day
      setAdhkarProgress(0);
      setQuranRead(false);
      setPrayersCompleted({
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      });
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (adhkar, quran, prayers) => {
    const today = moment().format("YYYY-MM-DD");
    const data = {
      adhkarProgress: adhkar,
      quranRead: quran,
      prayersCompleted: prayers || prayersCompleted,
      date: today,
    };
    localStorage.setItem(`todo_${today}`, JSON.stringify(data));
  };

  // Handle adhkar progress toggle
  const handleAdhkarClick = () => {
    let newProgress;
    if (adhkarProgress < 2) {
      newProgress = adhkarProgress + 1;
    } else {
      // If at 2, reset to 0 (uncheck)
      newProgress = 0;
    }
    setAdhkarProgress(newProgress);
    saveProgress(newProgress, quranRead, prayersCompleted);
  };

  // Handle Quran reading toggle
  const handleQuranClick = () => {
    const newQuranRead = !quranRead;
    setQuranRead(newQuranRead);
    saveProgress(adhkarProgress, newQuranRead, prayersCompleted);
  };

  // Handle prayer toggle
  const handlePrayerClick = (prayer) => {
    const newPrayersCompleted = {
      ...prayersCompleted,
      [prayer]: !prayersCompleted[prayer],
    };
    setPrayersCompleted(newPrayersCompleted);
    saveProgress(adhkarProgress, quranRead, newPrayersCompleted);
  };

  const isEvening = adhkarType === "evening";
  // Use separate keys for morning and evening parts
  const adhkarPrefix = "أذكار ";
  const morningPart = t("morning"); // "الصباح"
  const eveningPart = t("evening"); // "المساء"
  
  // Handle navigation to azkar pages
  const handleMorningClick = (e) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    setCurrentPage("azkar-أذكار الصباح");
  };
  
  const handleEveningClick = (e) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    setCurrentPage("azkar-أذكار المساء");
  };

  return (
    <div className={`fadeIn bg-transparent`}>
      <div className={`flex flex-col`}>
        <div
          className={`bg-bg-color-2 border border-bg-color-3 rounded-lg mx-4 mb-4 mt-2`}
        >
          {/* Adhkar Todo */}
          <div
            className={`flex flex-row-reverse items-center py-1 px-2 cursor-pointer transition-all`}
            onClick={handleAdhkarClick}
          >
            <div
              className={`text-${window.api.getColor()}-500 flex-shrink-0 flex flex-row-reverse items-center gap-2`}
            >
              {adhkarProgress === 2 ? (
                <IconCheck size={20} />
              ) : (
                <IconCircle size={20} />
              )}
              <div className={`flex gap-1`}>
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    adhkarProgress >= 1
                      ? `bg-${window.api.getColor()}-500`
                      : "bg-bg-color-3"
                  }`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    adhkarProgress >= 2
                      ? `bg-${window.api.getColor()}-500`
                      : "bg-bg-color-3"
                  }`}
                />
              </div>
            </div>
            <div className={`flex flex-col items-start flex-1`}>
              <h1 className={`text-base font-medium`}>
                {isEvening ? (
                  <>
                    <span className="text-text">{adhkarPrefix}</span>
                    <span
                      onClick={handleMorningClick}
                      className={`underline decoration-${window.api.getColor()}-500 ${
                        adhkarProgress >= 1
                          ? `text-${window.api.getColor()}-500 line-through cursor-pointer hover:opacity-80 transition-opacity`
                          : "text-text cursor-pointer hover:opacity-80 transition-opacity"
                      }`}
                    >
                      {morningPart}
                    </span>
                    <span className="text-text">{` ${t("and")} `}</span>
                    <span
                      onClick={handleEveningClick}
                      className={`underline decoration-${window.api.getColor()}-500 ${
                        adhkarProgress >= 2
                          ? `text-${window.api.getColor()}-500 line-through cursor-pointer hover:opacity-80 transition-opacity`
                          : "text-text cursor-pointer hover:opacity-80 transition-opacity"
                      }`}
                    >
                      {eveningPart}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-text">{adhkarPrefix}</span>
                    <span
                      onClick={handleMorningClick}
                      className={`underline decoration-${window.api.getColor()}-500 ${
                        adhkarProgress === 2
                          ? `text-${window.api.getColor()}-500 line-through cursor-pointer hover:opacity-80 transition-opacity`
                          : "text-text cursor-pointer hover:opacity-80 transition-opacity"
                      }`}
                    >
                      {morningPart}
                    </span>
                  </>
                )}
              </h1>
            </div>
          </div>

          {/* HR Separator */}
          <hr className={`border-bg-color-3 my-0`} />

          {/* Quran Reading Todo */}
          <div
            className={`flex flex-row-reverse items-center py-1 px-2 cursor-pointer transition-all`}
            onClick={handleQuranClick}
          >
            <div
              className={`text-${window.api.getColor()}-500 flex-shrink-0 flex flex-row-reverse items-center gap-2`}
            >
              {quranRead ? <IconCheck size={20} /> : <IconCircle size={20} />}
            </div>
            <div className={`flex flex-col items-start flex-1`}>
              <h1
                className={`text-base font-medium ${
                  quranRead
                    ? `text-${window.api.getColor()}-500 line-through`
                    : "text-text"
                }`}
              >
                {t("quran_reading")}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoList;
