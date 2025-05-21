import React, { useState } from 'react';
import moment from 'moment';
import momentHijri from 'moment-hijri';
import { useTranslation } from 'react-i18next';
import { IconChevronRight, IconChevronLeft, IconCalendar } from '@tabler/icons-react';

const Calendar = () => {
  const { t } = useTranslation();
  const [isHijri, setIsHijri] = useState(true);
  const [currentDate, setCurrentDate] = useState(moment());

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
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return number.toString().replace(/[0-9]/g, (digit) => arabicNumbers[digit]);
  };

  const getWeekDays = () => {
    const days = [
      t('sun'),
      t('mon'),
      t('tue'),
      t('wed'),
      t('thu'),
      t('fri'),
      t('sat')
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
      ? momentHijri(currentDate).startOf('iMonth')
      : moment(currentDate).startOf('month');
    const endOfMonth = isHijri
      ? momentHijri(currentDate).endOf('iMonth')
      : moment(currentDate).endOf('month');
    
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
      currentDay.add(1, 'day');
    }
    
    return days;
  };

  const formatDate = (date) => {
    const day = isHijri ? date.format('iD') : date.format('D');
    return isHijri ? toArabicNumbers(day) : day;
  };

  const getMonthYear = () => {
    if (isHijri) {
      const monthKey = momentHijri(currentDate).format('iM');
      const month = t(`months.hijri.${monthKey}`);
      const year = toArabicNumbers(momentHijri(currentDate).format('iYYYY'));
      return `${month} ${year}`;
    } else {
      const monthKey = currentDate.format('M');
      const month = t(`months.gregorian.${monthKey}`);
      const year = currentDate.format('YYYY');
      return `${month} ${year}`;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      if (isHijri) {
        return direction === 'next'
          ? momentHijri(prevDate).add(1, 'iMonth')
          : momentHijri(prevDate).subtract(1, 'iMonth');
      } else {
        return direction === 'next'
          ? moment(prevDate).add(1, 'month')
          : moment(prevDate).subtract(1, 'month');
      }
    });
  };

  const formatSecondaryDate = (date) => {
    if (isHijri) {
      // When in Hijri mode, show Gregorian date
      const day = date.format('D');
      const monthKey = date.format('M');
      const month = t(`months.gregorian.${monthKey}`);
      return `${day} ${month}`;
    } else {
      // When in Gregorian mode, show Hijri date
      const hijriDate = momentHijri(date);
      const day = hijriDate.format('iD');
      const monthKey = hijriDate.format('iM');
      const month = t(`months.hijri.${monthKey}`);
      return `${toArabicNumbers(day)} ${month}`;
    }
  };

  return (
    <div
      className={`mx-auto py-8 px-4 text-text fadeIn min-h-screen relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-6">
      <h1 className={`text-3xl font-medium text-text px-4 text-start`}>
      {t('calendar')}</h1>
      </div>

      <div className="p-4">
      <button
          onClick={toggleCalendar}
          className={`flex items-center m-auto mb-4 gap-2 px-4 py-2 rounded-lg bg-bg-color-2 hover:bg-bg-color-3 border border-bg-color-3`}
        >
          <IconCalendar size={20} />
          <span>{isHijri ? t('switch_to_gregorian') : t('switch_to_hijri')}</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-bg-color-2"
          >
            <IconChevronRight />
          </button>
          <h3 className="text-xl font-medium">{getMonthYear()}</h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-bg-color-2"
          >
            <IconChevronLeft />
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
          {getMonthDays().map((day, index) => (
            <div
              key={index}
              className={`p-2 text-start transition-all border-b border-bg-color-3 flex flex-col justify-start ${
                day && day.isSame(moment(), 'day')
                  ? `bg-${window.api.getColor()}-500/25 text-${window.api.getColor()}-500`
                  : 'hover:bg-bg-color-2'
              }`}
            >
              {day ? formatDate(day) : ''}
              <span className={`text-sm text-text-2 text-end`}>
                {day ? formatSecondaryDate(day) : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 