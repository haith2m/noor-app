/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";
import { usePage } from "../../PageContext";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

function Azkar() {
  const { t, i18n } = useTranslation();
  const [azkar, setAzkar] = useState([]);
  const [azkarPage, setAzkarPage] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState({
    next: false,
    back: true,
    count: false,
  });
  const [azkarCount, setAzkarCount] = useState(0);
  const [azkarPath, setAzkarPath] = useState("");
  const { currentPage, setCurrentPage } = usePage();
  const category = currentPage.split("-")[1];
  
  useEffect(() => {
    const fetchPath = async () => {
      const path = await window.api.getResourcePath("azkar.json");
      setAzkarPath(path);
    };

    fetchPath();
  }, []);
  useEffect(() => {
    if (!azkarPath) return;

    fetch(`${azkarPath}`)
      .then((res) => res.json())
      .then(
        (result) => {
          // remove the stop content
          result[category] = result[category].filter(
            (item) => item.content !== "stop"
          );
          setAzkar(result[category]);
        },
        (error) => {}
      );
  }, [currentPage, azkarPath]);

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      handleCount();
    }
  });

  const handleCount = () => {
    setAzkarCount(azkarCount + 1);
    const count = azkar[azkarPage].count
      ? azkar[azkarPage].count
      : azkar[azkarPage][0].count;
    if (azkarCount + 1 >= count) {
      setButtonDisabled({ ...buttonDisabled, count: true });
    }
  };

  const handleNext = () => {
    if (azkarPage + 1 >= azkar.length) {
      setButtonDisabled({ ...buttonDisabled, next: true });
      return;
    }
    setAzkarPage(azkarPage + 1);
    setAzkarCount(0);
    setButtonDisabled({ next: false, back: false, count: false });
  };

  const handleBack = () => {
    // when the back button is clicked, check if its the first page to disable the back button
    if (azkarPage - 1 <= 0) {
      setAzkarPage(0);
      setButtonDisabled({ ...buttonDisabled, back: true });
      return;
    }
    setAzkarPage(azkarPage - 1);
    setAzkarCount(0);
    setButtonDisabled({ next: false, back: false, count: false });
  };

  if (azkar.length === 0) return <Loading />;

  return (
    <div
      className={`mx-auto py-8 fadeIn relative overflow-hidden`}
    >
      {azkar.length > 0 && azkar[azkarPage].content !== "stop" ? (
        <>
          <button
            className={`flex flex-row w-fit items-center gap-2 mt-4 me-auto px-4 relative z-50 text-${window.api.getColor()}-500`}
            onClick={() => setCurrentPage("azkar")}
          >
            <IconChevronRight />
            <h1 className={`text-base font-medium`}>{t("return")}</h1>
          </button>
          <div
            className={`flex flex-col gap-2 p-4 rounded-lg w-full h-full fadeIn`}
          >
            <h1 className={`text-xl font-medium text-text py-4`}>
              {t(category)}
            </h1>
            <div className={`flex flex-col gap-2 py-6`}>
              <h1
                className={`text-2xl text-${window.api.getColor()}-500 naskh-font`}
              >
                {azkar[azkarPage].content
                  ? azkar[azkarPage].content
                      .replace(/\\n/g, "\n")
                      .replace(/'/g, "")
                      .replace(/,/g, "")
                  : azkar[azkarPage][0].content}
              </h1>
              <span className={`text-sm font-normal text-text-2`}>
                {Number(
                  azkar[azkarPage].count
                    ? azkar[azkarPage].count
                    : azkar[azkarPage][0].count
                ).toString()}{" "}
                {t("times")}
              </span>{" "}
            </div>
            <div
              className={`flex flex-row justify-between gap-4 px-4 fixed right-0 left-0 bg-bg-color-2 ms-auto bottom-0 w-[calc(100%-4rem)] border-bg-color`}
            >
              <button
                className={`flex flex-row justify-between gap-4 m-auto p-4 relative z-50 ${
                  buttonDisabled.back ? "disabled cursor-not-allowed" : ""
                }`}
                onClick={handleBack}
              >
                <h1
                  className={`text-base font-medium flex items-center text-${window.api.getColor()}-500`}
                >
                  {i18n.language === "ar" ? (
                    <IconChevronRight />
                  ) : (
                    <IconChevronLeft />
                  )}
                  {t("back")}
                </h1>
              </button>
              <div
                className={`flex flex-col items-center justify-center gap-4`}
              >
                <button
                  className={`w-14 h-14 m-2 rounded-full p-4 bg-${window.api.getColor()}-500/25 border-2 border-${window.api.getColor()}-500 text-${window.api.getColor()}-500 flex items-center text-2xl justify-center active:scale-90 transition-all ${
                    buttonDisabled.count ? "disabled" : ""
                  }`}
                  onClick={handleCount}
                >
                  {azkarCount}
                </button>
              </div>
              <button
                className={`flex flex-row justify-between gap-4 m-auto p-4 relative z-50 ${
                  buttonDisabled.next ? "disabled cursor-not-allowed" : ""
                }`}
                onClick={handleNext}
              >
                <h1
                  className={`text-base font-medium flex items-center text-${window.api.getColor()}-500`}
                >
                  {t("next")}
                  {i18n.language === "ar" ? (
                    <IconChevronLeft />
                  ) : (
                    <IconChevronRight />
                  )}
                </h1>
              </button>
            </div>
            <span className={`text-sm font-normal text-text-2`}>
              {Number(azkarPage) + 1}/{azkar.length}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Azkar;
