import { useEffect, useState } from "react";
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
import { getWidgetStyles, getWidgetColorWithShade, getWidgetBgColorWithShade } from "./widgetUtils";

function PrayerTimesWidget() {
  const { t } = useTranslation();
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

        const coordinates = new Coordinates(location.latitude, location.longitude);
        const method = CalculationMethod[settings.calculationMethod || "UmmAlQura"]();
        const date = new Date();
        const prayerTimes = new PrayerTimes(coordinates, date, method);

        const corrections = settings.prayerTimeCorrections || {};
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

        let nextPrayer = prayerTimes.nextPrayer();
        if (nextPrayer === "none" || nextPrayer === "sunrise") {
          const fivePrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
          const currentIndex = fivePrayers.indexOf(currentPrayer);
          nextPrayer = fivePrayers[(currentIndex + 1) % fivePrayers.length];
        }

        const times = {
          fajr: {
            time: applyCorrectionToTime(prayerTimes.fajr, "fajr"),
            icon: <IconSunrise size={20} className={getWidgetColorWithShade("secondary")} />,
          },
          dhuhr: {
            time: applyCorrectionToTime(prayerTimes.dhuhr, "dhuhr"),
            icon: <IconSun size={20} className={getWidgetColorWithShade("secondary")} />,
          },
          asr: {
            time: applyCorrectionToTime(prayerTimes.asr, "asr"),
            icon: <IconCloud size={20} className={getWidgetColorWithShade("secondary")} />,
          },
          maghrib: {
            time: applyCorrectionToTime(prayerTimes.maghrib, "maghrib"),
            icon: <IconSunset size={20} className={getWidgetColorWithShade("secondary")} />,
          },
          isha: {
            time: applyCorrectionToTime(prayerTimes.isha, "isha"),
            icon: <IconMoon size={20} className={getWidgetColorWithShade("secondary")} />,
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
    setRefreshKey(prev => prev + 1);
  };

  if (!prayersData) {
    return (
      <div 
        className={`bg-bg-color-2 border border-bg-color-3 p-4`}
        style={{ 
          borderRadius: getWidgetStyles().borderRadius,
          backgroundColor: getWidgetStyles().backgroundColor,
          borderColor: getWidgetStyles().borderColor,
        }}
      >
        <p className={`text-sm text-text-2`}>{t("loading")}...</p>
      </div>
    );
  }

  const widgetStyles = getWidgetStyles();

  return (
    <div 
      className={`bg-bg-color-2 border border-bg-color-2 p-4 w-full flex flex-col relative`}
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
        <IconRotateClockwise size={14} className={getWidgetColorWithShade("accent")} />
      </button>
      <h3 className={`text-lg font-medium text-text mb-3`}>{t("prayer_times")}</h3>
      
      <div className={`flex flex-row gap-2 flex-1`}>
        {Object.entries(prayersData.times)
          .map(([prayer, { time, icon }]) => {
            const isNextPrayer = prayer === prayersData.nextPrayer;
            return (
              <div
                key={prayer}
                className={`flex flex-col gap-1 p-2 rounded flex-1 min-w-0 ${
                  isNextPrayer
                    ? getWidgetBgColorWithShade("primary", 50)
                    : `bg-bg-color-3 border-bg-color-3 border`
                }`}
              >
                <div className={`flex items-center gap-2`}>
                  {icon}
                  <span className={`text-xs ${isNextPrayer ? `text-text font-medium` : 'text-text-2'}`}>
                    {t(prayer).replace("صلاة", "").trim()}
                  </span>
                </div>
                <span className={`text-sm font-medium w-fit text-center mx-auto text-text`}>
                  {moment(time).format("hh:mm")}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default PrayerTimesWidget;

