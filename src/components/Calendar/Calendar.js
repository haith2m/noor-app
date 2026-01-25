import React, { useState, useEffect } from "react";
import moment from "moment";
import momentHijri from "moment-hijri";
import { useTranslation } from "react-i18next";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCalendar,
} from "@tabler/icons-react";

const Calendar = () => {
  const { t, i18n } = useTranslation();
  const [isHijri, setIsHijri] = useState(true);
  const [currentDate, setCurrentDate] = useState(moment());
  const [events, setEvents] = useState([]);
  const [eventsPath, setEventsPath] = useState("");

  useEffect(() => {
    const fetchEventsPath = async () => {
      try {
        if (window.api && window.api.getResourcePath) {
          const path = await window.api.getResourcePath(
            "data/calendar/events.json"
          );
          setEventsPath(path);
        } else {
          setEventsPath(`${process.env.PUBLIC_URL}/data/calendar/events.json`);
        }
      } catch (error) {
        console.error("Error fetching events path:", error);
        setEventsPath(`${process.env.PUBLIC_URL}/data/calendar/events.json`);
      }
    };

    fetchEventsPath();
  }, []);

  useEffect(() => {
    if (!eventsPath) return;

    fetch(eventsPath)
      .then((res) => res.json())
      .then((result) => {
        setEvents(result);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, [eventsPath]);

  const toggleCalendar = () => {
    if (isHijri) {
      // Convert from Hijri to Gregorian
      const hijriDate = momentHijri(currentDate);
      const gregorianDate = moment(hijriDate.toDate());
      setCurrentDate(gregorianDate);
    } else {
      // Convert from Gregorian to Hijri
      const hijriDate = momentHijri(currentDate.toDate());
      setCurrentDate(hijriDate);
    }
    setIsHijri(!isHijri);
  };

  const toArabicNumbers = (number) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return number.toString().replace(/[0-9]/g, (digit) => arabicNumbers[digit]);
  };

  const getWeekDays = () => {
    const days = [
      t("sun"),
      t("mon"),
      t("tue"),
      t("wed"),
      t("thu"),
      t("fri"),
      t("sat"),
    ];

    // For Hijri calendar, start with Saturday (Islamic week starts on Saturday)
    if (isHijri) {
      return [...days.slice(6), ...days.slice(0, 6)];
    }

    // For Gregorian calendar, start with Sunday
    return days;
  };

  const getMonthDays = () => {
    const startOfMonth = isHijri
      ? momentHijri(currentDate).startOf("iMonth")
      : moment(currentDate).startOf("month");
    const endOfMonth = isHijri
      ? momentHijri(currentDate).endOf("iMonth")
      : moment(currentDate).endOf("month");

    // Get the first day of the month
    const firstDay = startOfMonth.day();

    // For Hijri calendar, adjust the starting day to match Islamic week
    const adjustedFirstDay = isHijri ? (firstDay + 1) % 7 : firstDay;

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    let currentDay = startOfMonth.clone();

    while (currentDay.isSameOrBefore(endOfMonth)) {
      days.push(currentDay.clone());
      currentDay.add(1, "day");
    }

    return days;
  };

  const formatDate = (date) => {
    const day = isHijri ? date.format("iD") : date.format("D");
    return isHijri ? toArabicNumbers(day) : day;
  };

  const getMonthYear = () => {
    if (isHijri) {
      const monthKey = momentHijri(currentDate).format("iM");
      const month = t(`months.hijri.${monthKey}`);
      const year =
        i18n.language === "en"
          ? momentHijri(currentDate).format("iYYYY")
          : toArabicNumbers(momentHijri(currentDate).format("iYYYY"));
      return `${month} ${year}`;
    } else {
      const monthKey = currentDate.format("M");
      const month = t(`months.gregorian.${monthKey}`);
      const year = currentDate.format("YYYY");
      return `${month} ${year}`;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      if (isHijri) {
        return direction === "next"
          ? momentHijri(prevDate).add(1, "iMonth")
          : momentHijri(prevDate).subtract(1, "iMonth");
      } else {
        return direction === "next"
          ? moment(prevDate).add(1, "month")
          : moment(prevDate).subtract(1, "month");
      }
    });
  };

  const formatSecondaryDate = (date) => {
    if (isHijri) {
      // When in Hijri mode, show Gregorian date
      const day = date.format("D");
      const monthKey = date.format("M");
      const month = t(`months.gregorian.${monthKey}`);
      return `${day} ${month}`;
    } else {
      // When in Gregorian mode, show Hijri date
      const hijriDate = momentHijri(date);
      const day = hijriDate.format("iD");
      const monthKey = hijriDate.format("iM");
      const month = t(`months.hijri.${monthKey}`);
      return `${toArabicNumbers(day)} ${month}`;
    }
  };

  const isWhiteDay = (date) => {
    if (!date) return false;
    
    // Always check based on Hijri date (white days are 13, 14, 15 of every Hijri month)
    const hijriDate = momentHijri(date);
    const hijriDay = parseInt(hijriDate.format("iD"));
    return hijriDay === 13 || hijriDay === 14 || hijriDay === 15;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];

    const dayEvents = [];

    if (isHijri) {
      // In Hijri mode, match directly with Hijri dates
      const hijriDate = momentHijri(date);
      const hijriMonth = parseInt(hijriDate.format("iM"));
      const hijriDay = parseInt(hijriDate.format("iD"));

      // Add events from JSON
      dayEvents.push(...events.filter(
        (event) => event.month === hijriMonth && event.day === hijriDay
      ));

      // Add white days if applicable
      if (isWhiteDay(date)) {
        dayEvents.push({
          nameKey: "white_days",
          month: hijriMonth,
          day: hijriDay,
          color: "green"
        });
      }
    } else {
      // In Gregorian mode, convert event Hijri dates to Gregorian and match
      const gregorianMonth = parseInt(date.format("M"));
      const gregorianDay = parseInt(date.format("D"));
      const gregorianYear = parseInt(date.format("YYYY"));
      
      // Get approximate Hijri year from current Gregorian date
      const currentHijri = momentHijri(date);
      const hijriYear = parseInt(currentHijri.format("iYYYY"));
      const hijriMonth = parseInt(currentHijri.format("iM"));
      const hijriDay = parseInt(currentHijri.format("iD"));

      // Add events from JSON
      dayEvents.push(...events.filter((event) => {
        try {
          // Create a Hijri date from the event using the current Hijri year
          const hijriDate = momentHijri(`${hijriYear}-${event.month}-${event.day}`, "iYYYY-iM-iD");
          // Convert to Gregorian
          const gregorianEventDate = moment(hijriDate.toDate());
          
          return (
            gregorianEventDate.year() === gregorianYear &&
            gregorianEventDate.month() + 1 === gregorianMonth &&
            gregorianEventDate.date() === gregorianDay
          );
        } catch (error) {
          return false;
        }
      }));

      // Add white days if applicable
      if (isWhiteDay(date)) {
        dayEvents.push({
          nameKey: "white_days",
          month: hijriMonth,
          day: hijriDay,
          color: "green",
          gregorianDate: moment(date),
          gregorianDay: gregorianDay,
          gregorianMonth: gregorianMonth,
          gregorianYear: gregorianYear
        });
      }
    }

    return dayEvents;
  };

  const getColorClass = (color) => {
    const colorMap = {
      orange: "bg-orange-500",
      purple: "bg-purple-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
    };
    return colorMap[color] || "bg-gray-500";
  };

  const getEventsForCurrentMonth = () => {
    const monthEvents = [];

    if (isHijri) {
      // In Hijri mode, filter by Hijri month
      const hijriDate = momentHijri(currentDate);
      const hijriMonth = parseInt(hijriDate.format("iM"));

      // Add events from JSON
      monthEvents.push(...events
        .filter((event) => event.month === hijriMonth)
        .map(event => ({ ...event }))
      );

      // Add white days (13, 14, 15) for current Hijri month
      for (let day = 13; day <= 15; day++) {
        monthEvents.push({
          nameKey: "white_days",
          month: hijriMonth,
          day: day,
          color: "green"
        });
      }

      return monthEvents.sort((a, b) => a.day - b.day);
    } else {
      // In Gregorian mode, convert events to Gregorian and filter by current month
      const gregorianMonth = parseInt(currentDate.format("M"));
      const gregorianYear = parseInt(currentDate.format("YYYY"));
      
      // Get approximate Hijri year from current Gregorian date
      const currentHijri = momentHijri(currentDate);
      const hijriYear = parseInt(currentHijri.format("iYYYY"));

      // Add events from JSON
      const jsonEvents = events
        .map((event) => {
          try {
            // Create a Hijri date from the event using the current Hijri year
            const hijriDate = momentHijri(`${hijriYear}-${event.month}-${event.day}`, "iYYYY-iM-iD");
            // Convert to Gregorian
            const gregorianEventDate = moment(hijriDate.toDate());
            
            return {
              ...event,
              gregorianDate: gregorianEventDate,
              gregorianDay: gregorianEventDate.date(),
              gregorianMonth: gregorianEventDate.month() + 1,
              gregorianYear: gregorianEventDate.year(),
            };
          } catch (error) {
            return null;
          }
        })
        .filter((event) => 
          event && 
          event.gregorianYear === gregorianYear &&
          event.gregorianMonth === gregorianMonth
        );

      monthEvents.push(...jsonEvents);

      // Add white days (13, 14, 15) for current Hijri month, converted to Gregorian
      for (let hijriDay = 13; hijriDay <= 15; hijriDay++) {
        try {
          const hijriDate = momentHijri(`${hijriYear}-${currentHijri.format("iM")}-${hijriDay}`, "iYYYY-iM-iD");
          const gregorianEventDate = moment(hijriDate.toDate());
          
          // Only add if it falls in the current Gregorian month
          if (
            gregorianEventDate.year() === gregorianYear &&
            gregorianEventDate.month() + 1 === gregorianMonth
          ) {
            monthEvents.push({
              nameKey: "white_days",
              month: parseInt(currentHijri.format("iM")),
              day: hijriDay,
              color: "green",
              gregorianDate: gregorianEventDate,
              gregorianDay: gregorianEventDate.date(),
              gregorianMonth: gregorianEventDate.month() + 1,
              gregorianYear: gregorianEventDate.year(),
            });
          }
        } catch (error) {
          // Skip if date conversion fails
        }
      }

      return monthEvents.sort((a, b) => {
        const dayA = a.gregorianDay || a.day;
        const dayB = b.gregorianDay || b.day;
        return dayA - dayB;
      });
    }
  };

  return (
    <div
      className={`mx-auto py-8 px-4 text-text fadeIn relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-6 px-4 relative w-full">
        <h1 className={`text-3xl font-medium text-text text-start`}>
          {t("calendar")}
        </h1>
        <button
          onClick={toggleCalendar}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-bg-color-2 hover:bg-bg-color-3 border border-bg-color-3`}
        >
          <IconCalendar size={20} />
          <span>
            {isHijri ? t("switch_to_gregorian") : t("switch_to_hijri")}
          </span>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-lg hover:bg-bg-color-2"
          >
            {i18n.language === "en" ? (
              <IconChevronLeft />
            ) : (
              <IconChevronRight />
            )}
          </button>
          <h3 className="text-xl font-medium">{getMonthYear()}</h3>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-lg hover:bg-bg-color-2"
          >
            {i18n.language === "en" ? (
              <IconChevronRight />
            ) : (
              <IconChevronLeft />
            )}
          </button>
        </div>
        <div className="grid grid-cols-7">
          {getWeekDays().map((day, index) => (
            <div
              key={index}
              className="text-center font-medium py-2 text-text-2 border-b border-bg-color-3"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {getMonthDays().map((day, index) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={index}
                className={`p-2 text-start transition-all border-b border-x-[.5px] border-bg-color-3 flex flex-col justify-start ${
                  day && day.isSame(moment(), "day")
                    ? `bg-${window.api.getColor()}-500/25 text-${window.api.getColor()}-500`
                    : "hover:bg-bg-color-2"
                }`}
              >
                {day ? formatDate(day) : ""}
                <div className="flex flex-row-reverse items-center justify-between gap-1">
                  <span className={`text-sm text-text-2`}>
                    {day ? formatSecondaryDate(day) : ""}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`${getColorClass(event.color)} w-2 h-2 rounded-full`}
                          title={event.nameKey ? t(event.nameKey) : event.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List for Current Month */}
      {getEventsForCurrentMonth().length > 0 && (
        <div className="mt-8 px-4 text-start">
          <h2 className="text-xl font-medium text-text mb-4">
            {t("events")}
          </h2>
          <div className="space-y-3">
            {getEventsForCurrentMonth().map((event, index) => {
              let dayDisplay, monthName;
              
              if (isHijri) {
                // In Hijri mode, show Hijri date
                const monthKey = event.month.toString();
                monthName = t(`months.hijri.${monthKey}`);
                dayDisplay =
                  i18n.language === "en"
                    ? event.day
                    : toArabicNumbers(event.day.toString());
              } else {
                // In Gregorian mode, show Gregorian date
                const monthKey = event.gregorianMonth.toString();
                monthName = t(`months.gregorian.${monthKey}`);
                dayDisplay =
                  i18n.language === "en"
                    ? event.gregorianDay
                    : event.gregorianDay.toString();
              }
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 text-start w-full bg-bg-color-2 rounded-lg"
                >
                  <div
                    className={`${getColorClass(event.color)} w-1 h-16 rounded-full`}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-text">{event.nameKey ? t(event.nameKey) : event.name}</span>
                    <span className="text-text-2 text-sm">
                      {dayDisplay} {monthName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
