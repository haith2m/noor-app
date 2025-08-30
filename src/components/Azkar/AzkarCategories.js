import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../Loading";
import { usePage } from "../../PageContext";
import i18n from "../../i18n";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { compatibleAPI } from "../../utils/webCompatibility";

function Azkar() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const { currentPage, setCurrentPage } = usePage();
  const [azkarPath, setAzkarPath] = useState('');

  useEffect(() => {
    const fetchPath = async () => {
      const path = await compatibleAPI.getResourcePath("azkar.json");
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
          setCategories(result);
        },
        (error) => {
          console.log(error);
        }
      );
  }, [azkarPath]);

  const category = currentPage.split("-")[1];

  if (categories.length === 0) return <Loading />;

  return (
    <div className={`mx-auto py-8 fadeIn relative overflow-hidden`}>
      {category ? (
        <Azkar />
      ) : (
        <>
          <h1 className={`text-3xl font-medium text-text px-8 pb-4 text-start`}>
            {t("azkar")}
          </h1>
          <div className={`px-4 grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4 m-auto justify-center`}>
            {Object.keys(categories).map((category, index) => (
              <button
                key={index}
                className={`flex flex-row justify-between gap-4 m-auto p-4 w-full h-full rounded-lg text-start transition-all bg-bg-color-2`}
                onClick={() => setCurrentPage(`azkar-${category}`)}
              >
                <h1 className={`text-base font-medium text-text w-full`}>
                  {t(category)}
                </h1>
                {i18n.language === "ar" ? (
                  <IconChevronLeft size={24} className={`text-${compatibleAPI.getColor()}-500`} />
                ) : (
                  <IconChevronRight size={24} className={`text-${compatibleAPI.getColor()}-500`} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Azkar;
