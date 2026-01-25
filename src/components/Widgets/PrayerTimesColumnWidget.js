import { useEffect, useState } from "react";
import { getWidgetStyles, getWidgetColorWithShade } from "./widgetUtils";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import {
  IconCloud,
  IconMoon,
  IconSun,
  IconSunrise,
  IconSunset,
  IconRotateClockwise,
} from "@tabler/icons-react";

function PrayerTimesColumnWidget() {
  const { t, i18n } = useTranslation();
  const [prayersData, setPrayersData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        const location = await window.api.getLocationData();
        const settings = window.api.getSettings();

        if (!location || !location.latitude || !location.longitude) {
          return;
        }

        const coordinates = new Coordinates(
          location.latitude,
          location.longitude
        );
        const method =
          CalculationMethod[settings.calculationMethod || "UmmAlQura"]();
        const date = new Date();
        const prayerTimes = new PrayerTimes(coordinates, date, method);

        const corrections = settings.prayerTimeCorrections || {};
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

        let nextPrayer = prayerTimes.nextPrayer();
        if (nextPrayer === "none" || nextPrayer === "sunrise") {
          const fivePrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
          const currentIndex = fivePrayers.indexOf(currentPrayer);
          nextPrayer = fivePrayers[(currentIndex + 1) % fivePrayers.length];
        }

        const times = {
          fajr: {
            time: applyCorrectionToTime(prayerTimes.fajr, "fajr"),
            icon: (
              <IconSunrise
                size={18}
                className={getWidgetColorWithShade("secondary")}
              />
            ),
          },
          dhuhr: {
            time: applyCorrectionToTime(prayerTimes.dhuhr, "dhuhr"),
            icon: (
              <IconSun
                size={18}
                className={getWidgetColorWithShade("secondary")}
              />
            ),
          },
          asr: {
            time: applyCorrectionToTime(prayerTimes.asr, "asr"),
            icon: (
              <IconCloud
                size={18}
                className={getWidgetColorWithShade("secondary")}
              />
            ),
          },
          maghrib: {
            time: applyCorrectionToTime(prayerTimes.maghrib, "maghrib"),
            icon: (
              <IconSunset
                size={18}
                className={getWidgetColorWithShade("secondary")}
              />
            ),
          },
          isha: {
            time: applyCorrectionToTime(prayerTimes.isha, "isha"),
            icon: (
              <IconMoon
                size={18}
                className={getWidgetColorWithShade("secondary")}
              />
            ),
          },
        };

        setPrayersData({
          times,
          nextPrayer,
        });
      } catch (error) {
        console.error("Error loading prayer times:", error);
      }
    };

    loadPrayerTimes();
    const interval = setInterval(loadPrayerTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRefreshKey((prev) => prev + 1);
  };

  const widgetStyles = getWidgetStyles();

  if (!prayersData) {
    return (
      <div
        className={`bg-bg-color-2 border border-bg-color-3 p-4 h-full w-full flex items-center justify-center`}
        style={{
          borderRadius: widgetStyles.borderRadius,
          backgroundColor: widgetStyles.backgroundColor,
          borderColor: widgetStyles.borderColor,
          color: widgetStyles.textColor,
          ...widgetStyles.widgetThemeVars,
        }}
      >
        <p className={`text-sm text-text-2`}>{t("loading")}...</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-bg-color-2 border border-bg-color-3 p-3 h-full w-full flex flex-col relative`}
      style={{
        borderRadius: widgetStyles.borderRadius,
        backgroundColor: widgetStyles.backgroundColor,
        borderColor: widgetStyles.borderColor,
        color: widgetStyles.textColor,
        ...widgetStyles.widgetThemeVars,
      }}
    >
      <button
        type="button"
        onClick={handleRefresh}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute top-2 left-2 p-1 rounded hover:bg-bg-color-3 transition-all active:scale-90 cursor-pointer z-10`}
        style={{ pointerEvents: "auto" }}
        title={t("refresh")}
      >
        <IconRotateClockwise
          size={14}
          className={getWidgetColorWithShade("accent")}
        />
      </button>

      <h3 className={`text-xl font-medium text-text mb-2 text-start`}>
        {t("prayer_times")}
      </h3>
      <p className={`text-sm text-text-2 mb-2 text-start`}>
        {new Intl.DateTimeFormat(`${i18n.language}-u-ca-islamic-umalqura`, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())}
      </p>

      <div className={`flex flex-col flex-1 justify-center`}>
        {Object.entries(prayersData.times).map(([prayer, { time, icon }]) => {
          const isNextPrayer = prayer === prayersData.nextPrayer;
          return (
            <div
              key={prayer}
              className={`flex items-center justify-between gap-2 p-2 rounded ${
                isNextPrayer ? `text-text` : `text-text-2`
              }`}
            >
              <div
                className={`flex items-center gap-2 flex-1 min-w-0 border-b border-bg-color-3 pb-1`}
              >
                <span
                  className={`text-sm ${isNextPrayer ? `text-text font-medium` : "text-text-2"} truncate`}
                >
                  {t(prayer).replace("صلاة", "").trim()}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${isNextPrayer ? `text-text` : `text-text-2`}`}
              >
                {moment(time).format("hh:mm")}{" "}
                <span className={`text-xs`}>
                  {moment(time).locale(i18n.language).format("A")}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrayerTimesColumnWidget;
