import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IconRotateClockwise } from "@tabler/icons-react";
import { getWidgetStyles, getWidgetColorWithShade } from "./widgetUtils";

function AzkarWidget() {
  const { t } = useTranslation();
  const [randomZikr, setRandomZikr] = useState(null);
  const [azkarPath, setAzkarPath] = useState("");

  useEffect(() => {
    const fetchPath = async () => {
      const path = await window.api.getResourcePath("data/azkar/azkar.json");
      setAzkarPath(path);
    };
    fetchPath();
  }, []);

  const getRandomZikr = useCallback(async () => {
    try {
      // If azkarPath is not set, fetch it first
      let path = azkarPath;
      if (!path) {
        path = await window.api.getResourcePath("data/azkar/azkar.json");
        setAzkarPath(path);
      }
      
      if (!path) {
        console.error("Azkar path not available");
        return;
      }
      
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch azkar: ${response.status}`);
      }
      
      const result = await response.json();
      const categories = result;
      const categoryKeys = Object.keys(categories);
      
      if (categoryKeys.length === 0) {
        console.error("No categories found in azkar data");
        return;
      }
      
      const randomCategory =
        categoryKeys[
          Math.floor(Math.random() * categoryKeys.length)
        ];
      
      if (!categories[randomCategory] || categories[randomCategory].length === 0) {
        console.error(`No zikr found in category: ${randomCategory}`);
        return;
      }
      
      const randomZikr =
        categories[randomCategory][
          Math.floor(Math.random() * categories[randomCategory].length)
        ];
      
      setRandomZikr({ ...randomZikr, category: randomCategory });
    } catch (error) {
      console.error("Error fetching random Zikr:", error);
    }
  }, [azkarPath]);

  useEffect(() => {
    if (azkarPath) {
      getRandomZikr();
    }
  }, [azkarPath, getRandomZikr]);

  const widgetStyles = getWidgetStyles();

  if (!randomZikr) {
    return (
      <div 
        className={`bg-bg-color-2 border border-bg-color-3 p-4`}
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

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    getRandomZikr();
  };

  return (
    <div 
      className={`bg-bg-color-2 border border-bg-color-3 p-4 h-full w-full flex flex-col relative`}
      style={{
        borderRadius: widgetStyles.borderRadius,
        backgroundColor: widgetStyles.backgroundColor,
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
      <div className={`flex items-center justify-between mb-2`}>
        <h3 className={`text-sm font-medium text-text-2`}>
          {t(randomZikr.category)}
        </h3>
      </div>
      <p className={`text-base font-medium ${getWidgetColorWithShade("primary")} naskh-font leading-relaxed mb-2 flex-1`}>
        {randomZikr.content.replace(/\\n/g, "\n").replace(/['",]/g, "")}
      </p>
      <span className={`text-xs text-text-2`}>
        {isNaN(Number(randomZikr.count))
          ? randomZikr.count
          : Number(randomZikr.count).toFixed(0)}{" "}
        {t("times")}
      </span>
    </div>
  );
}

export default AzkarWidget;

