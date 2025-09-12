import { useTranslation } from "react-i18next";
import moment from "moment";
import { IconLocationFilled } from "@tabler/icons-react";
import { usePage } from "../../PageContext";

function formatDate(date, language) {
  const months = {
    en: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    ar: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
  };

  const dayOfMonth = date.getDate().toString();
  const month = months[language][date.getMonth()];
  const year = date.getFullYear();

  return language === "ar"
    ? `${dayOfMonth} ${month} ${year}`
    : `${dayOfMonth} ${month} ${year}`;
}

function Header({ location, prayersData }) {
  const { t, i18n } = useTranslation();
  const currentPrayerTime = moment(
    prayersData.times[prayersData.nextPrayer].time,
    "HH:mm"
  );

  const { setCurrentPage } = usePage();

  return (
    <div className={`mx-auto p-4 relative z-0 bg-${window.api.getColor()}-500 bg-image fadeIn`}>
      <div onClick={() => {
        setCurrentPage("settings-location");
      }} className={`flex flex-row group relative items-center justify-center m-auto gap-1 mb-4 p-1 rounded-md w-fit hover:bg-black/10 cursor-pointer transition-all z-10`}>
        <IconLocationFilled size={16} stroke={1.5} className={`text-${window.api.getColor()}-700`} />
        <h1 className={`text-xl font-medium text-white select-none`}>
          {location.name}
        </h1>
      </div>
      <div className={`w-[calc(100%-1rem)] rounded-3xl flex flex-row max-md:flex-col max-md:items-center justify-between relative z-0`}>
        <div className={`flex flex-col items-start text-white p-6`}>
          <div className={`flex flex-col items-start max-md:items-center`}>
            <h1 className={`text-2xl font-medium`}>
              {t(`${prayersData.nextPrayer}`)}
            </h1>
            <p className={`text-4xl font-medium`}>
              {currentPrayerTime.format("hh:mm")}{" "}
              <span className={`text-base`}>
                {currentPrayerTime.locale(i18n.language).format("A")}
              </span>
            </p>
          </div>
        </div>
        <div className={`flex flex-col items-center justify-center text-white p-6`}>
          <h1 className={`text-2xl font-medium`}>
            {moment().locale(i18n.language).format("dddd")}
          </h1>
          <p className={`text-2xl font-medium w-full`}>
            {new Intl.DateTimeFormat(`${i18n.language}-u-ca-islamic-umalqura`, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </p>
          <p className={`text-lg font-normal w-full`}>
            {formatDate(new Date(), i18n.language)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Header;
