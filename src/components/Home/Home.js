import "moment/locale/ar";
import "moment/locale/en-gb";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useEffect, useState } from "react";
import i18n from "../../i18n";
import { IconRotateClockwise } from "@tabler/icons-react";
import NawafilModal from "./NawafilModal";

function Times({ prayersData }) {
  const { t } = useTranslation();
  const [remainingTimes, setRemainingTimes] = useState({});
  const [randomZikr, setRandomZikr] = useState(null);
  const [azkarPath, setAzkarPath] = useState("");

  useEffect(() => {
    const fetchPath = async () => {
      const path = await window.api.getResourcePath("azkar.json");
      setAzkarPath(path);
    };

    fetchPath();
  }, []);

  const getRandomZikr = async () => {
    try {
      await fetch(`${azkarPath}`)
        .then((res) => res.json())
        .then((result) => {
          const categories = result;
          console.log(categories);
          const randomCategory =
            Object.keys(categories)[
              Math.floor(Math.random() * Object.keys(categories).length)
            ];
          const randomZikr =
            categories[randomCategory][
              Math.floor(Math.random() * categories[randomCategory].length)
            ];
          console.log(randomZikr, randomCategory);
          setRandomZikr(randomZikr);

          return randomZikr;
        })
        .catch((error) => {
          console.error("Error fetching random Zikr:", error);
        });
    } catch (error) {
      console.error("Error fetching random Zikr:", error);
    }
  };

  const updateRemainingTimes = () => {
    const now = moment();
    const updatedTimes = Object.fromEntries(
      Object.entries(prayersData.times).map(([prayer, { time }]) => {
        const nextPrayerTime = moment(time, "HH:mm");
        const duration = moment.duration(nextPrayerTime.diff(now));
        const formattedTime = moment
          .utc(duration.asMilliseconds())
          .format("HH:mm:ss");
        return [prayer, prayersData.nextPrayer === prayer ? formattedTime : ""];
      })
    );
    setRemainingTimes(updatedTimes);
  };

  useEffect(() => {
    const interval = setInterval(updateRemainingTimes, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [prayersData]);

  useEffect(() => {
    getRandomZikr();
    // eslint-disable-next-line
  }, [azkarPath]);

  return (
    <div className={`pt-8 fadeIn h-fit bg-transparent `}>
      <div className={`flex flex-col`} id="prayer-times">
        <div className="flex flex-row items-center justify-between pe-4">
          <h1 className={`text-xl font-medium text-text px-4 text-start`}>
            {t("prayer_times")}
          </h1>
          <NawafilModal prayersData={prayersData} t={t} />
        </div>
        <div className={`grid grid-cols-2 gap-2 p-4`}>
          {Object.entries(prayersData.times)
            .sort(([prayer1]) => (prayer1 === prayersData.nextPrayer ? -1 : 1))

            .map(([prayer, { time, icon }]) => (
              <div
                key={prayer}
                className={`flex flex-row items-start justify-between relative p-2 bg-bg-color-2 ${
                  prayersData.nextPrayer === prayer
                    ? `col-span-2 bg-${window.api.getColor()}-500/25 border border-${window.api.getColor()}-500`
                    : "border border-bg-color-3"
                } rounded-lg`}
              >
                <div className={`flex flex-row items-center gap-4 my-auto`}>
                  <div className={`p-4`}>{icon}</div>
                  <div
                    className={`flex flex-col justify-between items-start w-full`}
                  >
                    <h1
                      className={`text-lg font-medium flex ${
                        prayersData.nextPrayer === prayer
                          ? `text-${window.api.getColor()}-500`
                          : "text-text"
                      }`}
                    >
                      {t(`${prayer}`)}
                    </h1>
                    <h1 className={`text-base font-medium text-text-2`}>
                      {moment(time, "HH:mm").format("hh:mm")}
                      <span className={`text-xs px-1`}>
                        {moment(time, "HH:mm")
                          .locale(i18n.language)
                          .format("A")}
                      </span>
                    </h1>
                  </div>
                </div>
                {prayersData.nextPrayer === prayer &&
                  remainingTimes[prayer] && (
                    <p
                      className={`text-base font-medium text-text text-start flex gap-2 items-center p-4`}
                    >
                      {t("after")}{" "}
                      <span className={`text-${window.api.getColor()}-500`}>
                        {remainingTimes[prayer]}
                      </span>
                    </p>
                  )}
              </div>
            ))}
        </div>
      </div>
      {randomZikr && randomZikr.content && (
        <div
          className={`bg-bg-color-2 border border-bg-color-3 rounded-lg p-4 m-4`}
        >
          <h1 className={`text-xl font-medium text-text px-4 text-start`}>
            {t(randomZikr.category)}
          </h1>
          <p
            className={`text-xl font-medium text-${window.api.getColor()}-500 p-4 naskh-font`}
          >
            {randomZikr.content.replace(/\\n/g, "\n").replace(/['",]/g, "")}
          </p>
          <span className={`text-base font-medium text-text-2 text-end p-4`}>
            {isNaN(Number(randomZikr.count))
              ? randomZikr.count
              : Number(randomZikr.count).toFixed(0)}{" "}
            {t("times")}
          </span>
          <br />
          <button
            onClick={getRandomZikr}
            className={`text-center text-text mt-2 transition-all duration-300 hover:rotate-12 active:rotate-180 ease-out`}
          >
            <IconRotateClockwise />
          </button>
        </div>
      )}
    </div>
  );
}

export default Times;
