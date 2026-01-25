import { useEffect, useState } from "react";
import PrayerTimesWidget from "./PrayerTimesWidget";
import PrayerTimesColumnWidget from "./PrayerTimesColumnWidget";
import NextPrayerWidget from "./NextPrayerWidget";
import QuranVerseWidget from "./QuranVerseWidget";
import CalendarWidget from "./CalendarWidget";
import AzkarWidget from "./AzkarWidget";
import { getWidgetSettings } from "./widgetUtils";

function WidgetRenderer({ widget }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth || window.screen?.width || 1920;
      const height = window.innerHeight || window.screen?.height || 1080;
      setDimensions({ width, height });
    };

    // Set initial dimensions immediately
    updateDimensions();
    
    // Also update after a short delay to ensure window is fully loaded
    const timeout = setTimeout(updateDimensions, 100);
    const timeout2 = setTimeout(updateDimensions, 500);
    
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [widget.id]);

  const renderWidget = () => {
    // Extract base widget ID (remove timestamp suffix)
    // Widget IDs are like "prayer-times-1768592805593", we need "prayer-times"
    const baseWidgetId = widget.id.split('-').slice(0, -1).join('-') || widget.id;
    // If it doesn't have a timestamp, try the full ID
    const widgetIdToCheck = widget.id.includes('-') && !isNaN(widget.id.split('-').pop()) 
      ? baseWidgetId 
      : widget.id;
    
    let component = null;
    
    switch (widgetIdToCheck) {
      case "prayer-times":
        component = <PrayerTimesWidget />;
        break;
      case "prayer-times-column":
        component = <PrayerTimesColumnWidget />;
        break;
      case "next-prayer":
        component = <NextPrayerWidget />;
        break;
      case "quran-verse":
        component = <QuranVerseWidget />;
        break;
      case "calendar":
      case "date": // Support "date" as alias for "calendar"
        component = <CalendarWidget />;
        break;
      case "azkar":
        component = <AzkarWidget />;
        break;
      default:
        console.warn("WidgetRenderer: Unknown widget id", widget.id, "base:", widgetIdToCheck);
        return (
          <div style={{ padding: "20px", backgroundColor: "orange", color: "black" }}>
            Unknown widget: {widget.id} (base: {widgetIdToCheck})
          </div>
        );
    }
    
    return component;
  };

  // Don't render if dimensions aren't ready - use fallback
  const fallbackWidth = window.screen?.width || 1920;
  const fallbackHeight = window.screen?.height || 1080;
  const finalDimensions = dimensions.width === 0 || dimensions.height === 0 
    ? { width: fallbackWidth, height: fallbackHeight }
    : dimensions;

  // Calculate grid cell size (120px per cell as defined in DesktopOverlay)
  // Must match exactly with DesktopOverlay calculation
  const cellSize = 120;
  const screenWidth = finalDimensions.width;
  const screenHeight = finalDimensions.height;
  const gridCols = Math.max(12, Math.floor(screenWidth / cellSize));
  const gridRows = Math.max(12, Math.floor(screenHeight / cellSize));

  // Calculate position - use widget coordinates if available, otherwise use fallback
  let left, top, width, height;
  
  if (widget.x !== undefined && widget.y !== undefined) {
    // Use screen dimensions for accurate positioning - must match DesktopOverlay exactly
    // Ensure coordinates are within grid bounds
    const validX = Math.max(0, Math.min(widget.x, gridCols - widget.width));
    const validY = Math.max(0, Math.min(widget.y, gridRows - widget.height));
    
    left = (validX / gridCols) * screenWidth;
    top = (validY / gridRows) * screenHeight;
    width = (widget.width / gridCols) * screenWidth;
    height = (widget.height / gridRows) * screenHeight;
  } else {
    // Fallback: position at top-left if coordinates are missing
    left = 100;
    top = 100;
    width = 300;
    height = 200;
  }

  const widgetSettings = getWidgetSettings();

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 100000,
      }}
      className="h-full w-full"
    >
      <div 
        className="h-full w-full p-2"
        style={{
          borderRadius: `${widgetSettings.borderRadius}px`,
        }}
      >
        {renderWidget()}
      </div>
    </div>
  );
}

export default WidgetRenderer;

