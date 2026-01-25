import { useEffect, useState } from "react";
import { getWidgetStyles, getWidgetColorWithShade } from "./widgetUtils";
import { useTranslation } from "react-i18next";
import { IconRotateClockwise } from "@tabler/icons-react";

function QuranVerseWidget() {
  const { t } = useTranslation();
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadRandomVerse = async () => {
      try {
        // Load a random verse from the Quran
        // For now, using a simple approach - you might want to use an API
        const verses = [
          { text: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ", surah: "هود", verse: 88 },
          { text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", surah: "البقرة", verse: 201 },
          { text: "وَمَنْ يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", surah: "الطلاق", verse: 2 },
          { text: "وَاللَّهُ خَيْرٌ حَافِظًا وَهُوَ أَرْحَمُ الرَّاحِمِينَ", surah: "يوسف", verse: 64 },
          { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "الشرح", verse: 5 },
        ];

        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        setVerse(randomVerse);
        setLoading(false);
      } catch (error) {
        console.error("Error loading verse:", error);
        setLoading(false);
      }
    };

    loadRandomVerse();
    // Refresh every hour
    const interval = setInterval(loadRandomVerse, 3600000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className={`bg-bg-color-2 border border-bg-color-3 rounded-lg p-4`}>
        <p className={`text-sm text-text-2`}>{t("loading")}...</p>
      </div>
    );
  }

  const widgetStyles = getWidgetStyles();

  if (!verse) return null;

  return (
    <div 
      className={`bg-bg-color-2 border border-bg-color-3 p-4 h-full w-full flex flex-col justify-center gap-2 relative`}
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
      <p className={`text-lg font-medium ${getWidgetColorWithShade("primary")} naskh-font text-center leading-relaxed`}>
        {verse.text}
      </p>
      <div className={`text-center`}>
        <span className={`text-xs text-text-2`}>
          {verse.surah} - {t("verse")} {verse.verse}
        </span>
      </div>
    </div>
  );
}

export default QuranVerseWidget;

