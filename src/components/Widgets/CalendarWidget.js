import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import momentHijri from "moment-hijri";
import { IconRotateClockwise } from "@tabler/icons-react";
import { getWidgetStyles, getWidgetColorWithShade } from "./widgetUtils";

function CalendarWidget() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(moment());
  const [primaryCalendar, setPrimaryCalendar] = useState("hijri"); // "hijri" or "gregorian"
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(moment());
    };

    updateDate();
    // Update every minute to keep dates in sync
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(moment());
    setRefreshKey(prev => prev + 1);
  };

  const toArabicNumbers = (number) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return number.toString().replace(/[0-9]/g, (digit) => arabicNumbers[digit]);
  };

  const formatHijriDate = () => {
    const hijriDate = momentHijri(currentDate);
    const day = hijriDate.format("iD");
    const monthKey = hijriDate.format("iM");
    const month = t(`months.hijri.${monthKey}`);
    const year = hijriDate.format("iYYYY");
    
    if (i18n.language === "ar") {
      return {day: toArabicNumbers(day), month, year: `${toArabicNumbers(year)} هـ`};
    }
    return {day, month, year};
  };

  const formatGregorianDate = () => {
    const day = currentDate.format("D");
    const monthKey = currentDate.format("M");
    const month = t(`months.gregorian.${monthKey}`);
    const year = currentDate.format("YYYY");
    
    if (i18n.language === "ar") {
      return {day: toArabicNumbers(day), month, year: toArabicNumbers(year)};
    }
    return {day, month, year};
  };

  const togglePrimary = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPrimaryCalendar(prev => {
      const newValue = prev === "hijri" ? "gregorian" : "hijri";
      return newValue;
    });
  };

  const isHijriPrimary = primaryCalendar === "hijri";
  const hijriDate = formatHijriDate();
  const gregorianDate = formatGregorianDate();
  const widgetStyles = getWidgetStyles();

  return (
    <div 
      className={`bg-bg-color-2 border border-bg-color-3 p-2 h-full w-full flex flex-col items-center justify-center gap-2 relative cursor-pointer`}
      onClick={togglePrimary}
      style={{ 
        pointerEvents: "auto",
        borderRadius: widgetStyles.borderRadius,
        backgroundColor: widgetStyles.backgroundColor,
        borderColor: widgetStyles.borderColor,
        color: widgetStyles.textColor,
        ...widgetStyles.widgetThemeVars,
      }}
      title={isHijriPrimary ? t("switch_to_gregorian") || "Click to switch to Gregorian" : t("switch_to_hijri") || "Click to switch to Hijri"}
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
      
      {/* Primary Calendar Date */}
      <div className={`flex flex-col items-center w-full flex-1 justify-center`}>
        {isHijriPrimary ? (
          <>
            <p className={`text-[7.5vh] font-bold leading-[1] ${getWidgetColorWithShade("primary")} text-center transition-all`}>
              {hijriDate.day}
            </p>
            <p className={`text-xl font-medium text-text text-center transition-all`}>
              {hijriDate.month}
            </p>
            <p className={`text-xl font-medium text-text text-center transition-all`}>
              {hijriDate.year}
            </p>
          </>
        ) : (
          <>
            <p className={`text-[7.5vh] font-bold leading-[1] ${getWidgetColorWithShade("primary")} text-center transition-all`}>
              {gregorianDate.day}
            </p>
            <p className={`text-xl font-medium text-text text-center transition-all`}>
              {gregorianDate.month}
            </p>
            <p className={`text-xl font-medium text-text text-center transition-all`}>
              {gregorianDate.year}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default CalendarWidget;

