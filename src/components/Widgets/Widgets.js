import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import PrayerTimesWidget from "./PrayerTimesWidget";
import PrayerTimesColumnWidget from "./PrayerTimesColumnWidget";
import NextPrayerWidget from "./NextPrayerWidget";
import QuranVerseWidget from "./QuranVerseWidget";
import CalendarWidget from "./CalendarWidget";
import AzkarWidget from "./AzkarWidget";
import Tooltip from "../Tooltip";

function Widgets() {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState([]);
  const isInitialMount = useRef(true);
  const previousWidgetsCount = useRef(0);

  const widgetCategories = useMemo(
    () => [
      {
        id: "prayer-times",
        name: t("prayer_times"),
        icon: "🕌",
        description:
          t("prayer_times_widget_description") || "Prayer time widgets",
        widgets: [
          {
            id: "prayer-times",
            name: t("prayer_times"),
            width: 4,
            height: 2,
            icon: "🕌",
            description:
              t("prayer_times_widget_description") ||
              "Display prayer times on your desktop",
            component: PrayerTimesWidget,
          },
          {
            id: "prayer-times-column",
            name: t("prayer_times_column") || "Prayer Times (Column)",
            width: 3,
            height: 4,
            icon: "🕌",
            description:
              t("prayer_times_column_widget_description") ||
              "Display prayer times in a column layout",
            component: PrayerTimesColumnWidget,
          },
          {
            id: "next-prayer",
            name: t("next_prayer"),
            width: 2,
            height: 2,
            icon: "🕐",
            description:
              t("next_prayer_widget_description") ||
              "Show the next prayer time",
            component: NextPrayerWidget,
          },
        ],
      },
      {
        id: "quran",
        name: t("quran"),
        icon: "📖",
        description: t("quran_widgets_description") || "Quran related widgets",
        widgets: [
          {
            id: "quran-verse",
            name: t("quran_verse"),
            width: 4,
            height: 2,
            icon: "📖",
            description:
              t("quran_verse_widget_description") ||
              "Show random Quranic verses",
            component: QuranVerseWidget,
          },
        ],
      },
      {
        id: "calendar",
        name: t("calendar"),
        icon: "📅",
        description: t("calendar_widget_description") || "Calendar widgets",
        widgets: [
          {
            id: "calendar",
            name: t("calendar"),
            width: 2,
            height: 2,
            icon: "📅",
            description:
              t("calendar_widget_description") ||
              "Display Hijri and Gregorian calendar",
            component: CalendarWidget,
          },
        ],
      },
      {
        id: "azkar",
        name: t("azkar"),
        icon: "📿",
        description: t("azkar_widget_description") || "Azkar widgets",
        widgets: [
          {
            id: "azkar",
            name: t("azkar"),
            width: 4,
            height: 2,
            icon: "📿",
            description:
              t("azkar_widget_description") ||
              "Show random Azkar and remembrances",
            component: AzkarWidget,
          },
        ],
      },
    ],
    [t]
  );

  useEffect(() => {
    const savedWidgets = window.api.getWidgets?.() || [];
    setWidgets(savedWidgets);
    previousWidgetsCount.current = savedWidgets.length;
  }, []);

  useEffect(() => {
    const handlePositionSelected = (position) => {
      const widgetToPlace = window.tempWidgetToPlace;
      if (widgetToPlace && position) {
        setWidgets((prevWidgets) => {
          const newWidget = {
            ...widgetToPlace,
            id: `${widgetToPlace.id}-${Date.now()}`,
            x: position.x,
            y: position.y,
          };
          const updatedWidgets = [...prevWidgets, newWidget];
          window.api.saveWidgets?.(updatedWidgets);
          window.tempWidgetToPlace = null;

          setTimeout(() => {
            window.api.showWidgetsWindow?.();
          }, 500);

          return updatedWidgets;
        });
      }
    };

    window.api.onWidgetPositionSelected?.(handlePositionSelected);
  }, []);

  const handleAddWidget = async (widget) => {
    // Components can't be cloned through Electron IPC, so create serializable object
    const serializableWidget = {
      id: widget.id,
      name: widget.name,
      width: widget.width,
      height: widget.height,
      icon: widget.icon,
      description: widget.description,
    };

    window.tempWidgetToPlace = widget;
    await window.api.showDesktopOverlay?.(serializableWidget);
  };

  const handleRemoveWidget = (widgetId) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updatedWidgets);
    window.api.saveWidgets?.(updatedWidgets);

    if (updatedWidgets.length === 0) {
      window.api.closeWidgetsWindow?.();
    }
  };

  const getWidgetBaseId = (widgetId) => {
    // Remove timestamp suffix from widget ID
    const parts = widgetId.split("-");
    if (parts.length >= 2 && !isNaN(parts[parts.length - 1])) {
      return parts.slice(0, -1).join("-");
    }
    return widgetId;
  };

  const getWidgetsByType = (widgetTypeId) => {
    return widgets.filter((w) => {
      const baseId = getWidgetBaseId(w.id);
      // Normalize "date" to "calendar" for backward compatibility
      const normalizedBaseId = baseId === "date" ? "calendar" : baseId;
      const normalizedTypeId =
        widgetTypeId === "date" ? "calendar" : widgetTypeId;
      return normalizedBaseId === normalizedTypeId;
    });
  };

  const getCategoryInstances = (category) => {
    return category.widgets.reduce((total, widget) => {
      return total + getWidgetsByType(widget.id).length;
    }, 0);
  };

  const getAllCategoryWidgetIds = () => {
    const allIds = new Set();
    widgetCategories.forEach((category) => {
      category.widgets.forEach((widget) => {
        allIds.add(widget.id);
        // "date" alias for "calendar" widget
        if (widget.id === "calendar") {
          allIds.add("date");
        }
      });
    });
    return allIds;
  };

  useEffect(() => {
    // Only show/hide widgets window when widgets change, not on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (previousWidgetsCount.current !== widgets.length) {
      previousWidgetsCount.current = widgets.length;

      if (widgets.length > 0) {
        window.api.showWidgetsWindow?.();
      } else {
        window.api.closeWidgetsWindow?.();
      }
    }
  }, [widgets]);

  return (
    <div className={`pt-8 fadeIn bg-transparent`}>
      <div className="flex flex-row items-center w-full pb-4 gap-4">
      <h1 className={`text-3xl font-medium text-text ps-8 text-start`}>
        {t("widgets")}
      </h1>
      <Tooltip message={t("beta_description")}>
      <button
        className={`bg-${window.api.getColor()}-500/25 text-sm border border-${window.api.getColor()}-500 text-white px-2 rounded-full`}
      >
        {t("beta")}
      </button>
      </Tooltip>
      </div>

      <div className={`px-4 pb-8`}>
        {widgetCategories.map((category) => {
          const categoryInstances = getCategoryInstances(category);
          const hasCategoryInstances = categoryInstances > 0;

          return (
            <div
              key={category.id}
              className={`mb-6 border border-bg-color-2 rounded-lg overflow-hidden transition-all`}
            >
              <div className={`p-4 bg-bg-color-2`}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div className="flex flex-col items-start flex-1">
                    <h2 className={`text-xl font-medium text-text`}>
                      {category.name}
                    </h2>
                    <p className={`text-sm text-text-2 mt-1`}>
                      {category.description}
                    </p>
                    {hasCategoryInstances && (
                      <span
                        className={`text-xs text-${window.api.getColor()}-500 mt-1`}
                      >
                        {categoryInstances}{" "}
                        {categoryInstances === 1
                          ? t("instance") || "instance"
                          : t("instances") || "instances"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={`p-4`}>
                <div
                  className={`flex flex-row gap-4 pb-4 w-full items-start overflow-auto widget-scrollbar`}
                >
                  {category.widgets.map((widget) => {
                    const widgetInstances = getWidgetsByType(widget.id);
                    const hasInstances = widgetInstances.length > 0;
                    const WidgetComponent = widget.component;

                    // Calculate widget size using same formula as desktop rendering (1920x1080 screen)
                    const cellSize = 120;
                    const previewScreenWidth = 1920;
                    const previewScreenHeight = 1080;
                    const gridCols = Math.max(
                      12,
                      Math.floor(previewScreenWidth / cellSize)
                    );
                    const gridRows = Math.max(
                      12,
                      Math.floor(previewScreenHeight / cellSize)
                    );

                    const calculatedWidth =
                      (widget.width / gridCols) * previewScreenWidth;
                    const calculatedHeight =
                      (widget.height / gridRows) * previewScreenHeight;

                    // Scale down proportionally to show full widget
                    const scalePercentage = 0.8;
                    const previewWidth = calculatedWidth * scalePercentage;
                    const previewHeight = calculatedHeight * scalePercentage;

                    return (
                      <div
                        key={widget.id}
                        className={`relative group`}
                        style={{
                          width: `${previewWidth}px`,
                        }}
                      >
                        <div
                          className={`rounded-lg bg-bg-color-2 border border-bg-color-3 relative`}
                          style={{
                            width: `${previewWidth}px`,
                            height: `${previewHeight}px`,
                          }}
                        >
                          <div
                            style={{
                              pointerEvents: "none",
                              width: `${previewWidth}px`,
                              height: `${previewHeight}px`,
                              position: "relative",
                            }}
                          >
                            <WidgetComponent />
                          </div>

                          <button
                            onClick={() => handleAddWidget(widget)}
                            className={`absolute top-2 right-2 p-1.5 bg-${window.api.getColor()}-500 text-white rounded-md hover:bg-${window.api.getColor()}-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10`}
                            title={t("add_widget") || "Add Widget"}
                          >
                            <IconPlus size={16} />
                          </button>
                        </div>

                        <div className={`mt-2 text-center`}>
                          <div className={`text-sm font-medium text-text`}>
                            {widget.name}
                          </div>
                          <div className={`text-xs text-text-2`}>
                            {widget.width} × {widget.height}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {category.widgets.some(
                  (w) => getWidgetsByType(w.id).length > 0
                ) && (
                  <div className={`mt-6 pt-4 border-t border-bg-color-3`}>
                    <h4 className={`text-sm font-medium text-text mb-3`}>
                      {t("existing_instances") || "Existing Instances"}
                    </h4>
                    <div className={`space-y-2`}>
                      {category.widgets.flatMap((widget) => {
                        const widgetInstances = getWidgetsByType(widget.id);
                        return widgetInstances.map((instance) => (
                          <div
                            key={instance.id}
                            className={`p-3 rounded-lg border border-bg-color-3 bg-bg-color-3/50 flex items-center justify-between`}
                          >
                            <div className={`flex flex-col gap-1`}>
                              <div className={`text-sm font-medium text-text`}>
                                {instance.name}
                              </div>
                              <div className={`text-xs text-text-2`}>
                                {t("position")}: ({instance.x}, {instance.y}) •{" "}
                                {t("size") || "Size"}: {instance.width} ×{" "}
                                {instance.height}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveWidget(instance.id)}
                              className={`p-2 hover:bg-red-500/20 rounded transition-all`}
                              title={t("remove") || "Remove"}
                            >
                              <IconTrash size={18} className={`text-red-500`} />
                            </button>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}{" "}
      </div>
    </div>
  );
}

export default Widgets;
