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

function NextPrayerWidget() {
  const { t } = useTranslation();
  const [prayersData, setPrayersData] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");
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

        const prayerIcons = {
          fajr: (
            <IconSunrise
              size={18}
              className={getWidgetColorWithShade("secondary")}
            />
          ),
          dhuhr: (
            <IconSun
              size={18}
              className={getWidgetColorWithShade("secondary")}
            />
          ),
          asr: (
            <IconCloud
              size={18}
              className={getWidgetColorWithShade("secondary")}
            />
          ),
          maghrib: (
            <IconSunset
              size={18}
              className={getWidgetColorWithShade("secondary")}
            />
          ),
          isha: (
            <IconMoon
              size={18}
              className={getWidgetColorWithShade("secondary")}
            />
          ),
        };

        const nextPrayerTime = applyCorrectionToTime(
          prayerTimes[nextPrayer],
          nextPrayer
        );

        setPrayersData({
          nextPrayer,
          nextPrayerTime,
          icon: prayerIcons[nextPrayer],
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

  useEffect(() => {
    if (!prayersData) return;

    const updateRemainingTime = () => {
      const now = moment();
      const nextPrayerTime = moment(prayersData.nextPrayerTime);

      // If next prayer time has passed, calculate for tomorrow
      if (nextPrayerTime.isBefore(now)) {
        nextPrayerTime.add(1, "day");
      }

      const duration = moment.duration(nextPrayerTime.diff(now));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setRemainingTime(formattedTime);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [prayersData]);

  const widgetStyles = getWidgetStyles();

  if (!prayersData) {
    return (
      <div
        className={`bg-bg-color-2 border border-bg-color-3 p-3 h-full w-full flex items-center justify-center`}
        style={{
          borderRadius: widgetStyles.borderRadius,
          backgroundColor: widgetStyles.backgroundColor,
          borderColor: widgetStyles.borderColor,
          color: widgetStyles.textColor,
          ...widgetStyles.widgetThemeVars,
        }}
      >
        <p className={`text-xs text-text-2`}>{t("loading")}...</p>
      </div>
    );
  }

  const prayerName = t(prayersData.nextPrayer);

  return (
    <div
      className={`bg-bg-color-2 border border-bg-color-3 p-3 h-full w-full flex flex-col justify-center gap-1 relative`}
      style={{
        borderRadius: widgetStyles.borderRadius,
        backgroundColor: widgetStyles.backgroundColor,
      }}
    >
      <button
        type="button"
        onClick={handleRefresh}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute top-1 right-1 p-1 rounded hover:bg-bg-color-3 transition-all active:scale-90 cursor-pointer z-10`}
        style={{ pointerEvents: "auto" }}
        title={t("refresh")}
      >
        <IconRotateClockwise
          size={12}
          className={getWidgetColorWithShade("primary")}
        />
      </button>

      <div className={`flex flex-col items-center gap-2 justify-center`}>
        <span
          className={`scale-[2]`}
        >
          {prayersData.icon}
        </span>
        <span
          className={`text-base font-medium ${getWidgetColorWithShade("primary")} mt-2`}
        >
          {prayerName} {t("after")}
        </span>
      </div>

      <div className={`text-center font-bold text-lg text-text`}>
        {remainingTime}
      </div>
    </div>
  );
}

export default NextPrayerWidget;
