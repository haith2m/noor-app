import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "../PageContext";
import Tooltip from "./Tooltip";
import LocationSearch from "./LocationSearch";
import {
  IconClock,
  IconInfoCircle,
  IconPalette,
  IconSettings,
  IconMapPin,
} from "@tabler/icons-react";
import { BsChevronDown, BsGithub } from "react-icons/bs";

const Settings = () => {
  const { t } = useTranslation();
  const { settings, editSettings, currentPage, setCurrentPage } = usePage();

  const [updatedSettings, setUpdatedSettings] = useState(settings);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Extract current section from currentPage (e.g., "settings-location" -> "location")
  const currentSection = currentPage.startsWith("settings-") 
    ? currentPage.split("-")[1] 
    : "appearance";

  useEffect(() => {
    setSettingsChanged(
      JSON.stringify(settings) !== JSON.stringify(updatedSettings)
    );
  }, [settings, updatedSettings]);

  useEffect(() => {
    const allSections = document.querySelectorAll("[data-section]");
    allSections.forEach((section) => {
      if (section.getAttribute("data-section") === currentSection) {
        section.style.display = "block";
      } else {
        section.style.display = "none";
      }
    });
  }, [currentSection]);

  useEffect(() => {
    // Fetch current location data
    const fetchLocationData = async () => {
      try {
        const locationData = await window.api.getLocationData();
        setCurrentLocation(locationData);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();

    // Listen for update check results
    const handleUpdateResult = (result) => {
      console.log("Received update result:", result);
      setIsCheckingUpdates(false);
      setUpdateStatus(result);

      // Clear the status after 5 seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 5000);
    };

    // Set up the event listener
    window.api.receive("update-check-result", handleUpdateResult);

    // Cleanup function
    return () => {
      // Remove the event listener if possible
      if (window.api.removeListener) {
        window.api.removeListener("update-check-result", handleUpdateResult);
      }
    };
  }, []);

  const handleChange = (key, value) => {
    setUpdatedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applySettings = async () => {
    // Check if run_on_startup setting changed
    if (settings.run_on_startup !== updatedSettings.run_on_startup) {
      // Send IPC message to enable/disable auto-launch
      window.api.setAutoLaunch(updatedSettings.run_on_startup);
    }

    // Check if location changed
    if (updatedSettings.location && 
        JSON.stringify(updatedSettings.location) !== JSON.stringify(currentLocation)) {
      try {
        // Update location
        await window.api.setLocationData(updatedSettings.location);
        setCurrentLocation(updatedSettings.location);
        
        // Remove location from settings since it's stored separately
        const { location, ...settingsWithoutLocation } = updatedSettings;
        editSettings(settingsWithoutLocation);
        
        // Reload page to update prayer times
        setTimeout(() => {
          window.api.reloadPage();
        }, 500);
      } catch (error) {
        console.error("Error setting location:", error);
      }
    } else {
      editSettings(updatedSettings);
    }
    
    setSettingsChanged(false);
  };

  const discardChanges = () => {
    setUpdatedSettings(settings);
    setSettingsChanged(false);
  };

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setUpdateStatus(null);
    window.api.checkForUpdates();
  };

  const getUpdateStatusMessage = () => {
    if (!updateStatus) return null;
    console.log(updateStatus);

    switch (updateStatus.type) {
      case "checking":
        return {
          text: t("checking_for_updates", "Checking for updates..."),
          color: "blue",
        };
      case "no-update":
        return {
          text: t("app_up_to_date", "You are running the latest version"),
          color: "green",
        };
      case "dev-mode":
        return {
          text: t(
            "updates_disabled_dev",
            "Update checking is disabled in development mode"
          ),
          color: "yellow",
        };
      case "error":
        return {
          text: t("update_check_failed", "Failed to check for updates"),
          color: "red",
        };
      default:
        return null;
    }
  };

  const methods = [
    "MuslimWorldLeague",
    "Egyptian",
    "Karachi",
    "UmmAlQura",
    "Dubai",
    "MoonsightingCommittee",
    "NorthAmerica",
    "Kuwait",
    "Qatar",
    "Singapore",
    "Tehran",
    "Turkey",
  ];

  const sections = [
    {
      name: t("appearance"),
      id: "appearance",
      icon: <IconPalette size={20} />,
      onClick: () => setCurrentPage("settings-appearance"),
    },
    {
      name: t("prayer_times"),
      id: "prayer_times",
      icon: <IconClock size={20} />,
      onClick: () => setCurrentPage("settings-prayer_times"),
    },
    {
      name: t("location"),
      id: "location",
      icon: <IconMapPin size={20} />,
      onClick: () => setCurrentPage("settings-location"),
    },
    {
      name: t("app_settings"),
      id: "app_settings",
      icon: <IconSettings size={20} />,
      onClick: () => setCurrentPage("settings-app_settings"),
    },
  ];

  const handleLocationSelect = (location) => {
    // Update location in updatedSettings to trigger settings confirmation
    setUpdatedSettings((prev) => ({ ...prev, location }));
  };

  return (
    <div
      className={`bg-transparent text-text flex flex-row transition-all fadeIn overflow-hidden`}
    >
      {/* sidebar */}
      <div className="flex flex-col items-start justify-start gap-4 bg-bg-color h-[calc(100vh-2.5rem)] border-e border-bg-color-3 p-4 w-1/3 overflow-hidden">
        {sections.map((section) => (
          <button
            key={section.name}
            className={`${
              currentSection === section.id
                ? `bg-bg-color-2 border-s-2 border-${window.api.getColor()}-500 rounded-s-none`
                : "bg-bg-color"
            } transition-colors p-2 w-full rounded-lg text-text px-4 flex flex-row items-center justify-start gap-2`}
            onClick={section.onClick}
          >
            {section.icon}
            {section.name}
          </button>
        ))}
        {/* app information */}
        <div className="flex flex-col items-start justify-end h-full gap-2 p-2">
          <p className="text-sm text-text-2">
            {t("version")} {window.api.getAppVersion()}
          </p>
          <p className="text-sm text-text-2">
            {t("electron_version")} {window.api.getElectronVersion()}
          </p>
          <p className="text-sm text-text-2">{t("license")} MIT License</p>
          <button
            onClick={() =>
              window.api.openURL("https://github.com/haith2m/noor-app")
            }
            className="text-sm flex flex-row items-center justify-start gap-2 text-text-2 hover:text-text transition-colors"
          >
            <BsGithub size={16} />
            {t("repository")}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full h-full p-6">
        <h1 className={`text-2xl font-medium text-start`}>
          {t(currentSection)}
        </h1>
        <div className="grid grid-cols-2 gap-8">
          <div
            id="setting-theme"
            data-section="appearance"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>{t("theme")}</h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("theme_description")}
            </p>
            <div className={`flex flex-row gap-2`}>
              <Tooltip message={t("light")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.theme === "light"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-white`}
                  onClick={() => handleChange("theme", "light")}
                />
              </Tooltip>
              <Tooltip message={t("dark")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.theme === "dark"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-black`}
                  onClick={() => handleChange("theme", "dark")}
                />
              </Tooltip>
            </div>
          </div>

          <div
            id="setting-color"
            data-section="appearance"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>{t("color")}</h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("color_description")}
            </p>
            <div className={`flex flex-row flex-wrap gap-2`}>
              <Tooltip message={t("green")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.color === "green"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-green-500`}
                  onClick={() => handleChange("color", "green")}
                />
              </Tooltip>
              <Tooltip message={t("blue")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.color === "blue"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-blue-500`}
                  onClick={() => handleChange("color", "blue")}
                />
              </Tooltip>
              <Tooltip message={t("red")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.color === "red"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-red-500`}
                  onClick={() => handleChange("color", "red")}
                />
              </Tooltip>
              <Tooltip message={t("yellow")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.color === "yellow"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-yellow-500`}
                  onClick={() => handleChange("color", "yellow")}
                />
              </Tooltip>
              <Tooltip message={t("purple")}>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    updatedSettings.color === "purple"
                      ? `border-${window.api.getColor()}-500`
                      : "border-bg-color-3"
                  } bg-purple-500`}
                  onClick={() => handleChange("color", "purple")}
                />
              </Tooltip>
            </div>
          </div>

          <div
            id="setting-language"
            data-section="appearance"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>
              {t("language")}
            </h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("language_description")}
            </p>
            <div className={`flex flex-row gap-2`}>
              <button
                className={`rounded-lg border bg-primary-500 ${
                  updatedSettings.language === "en"
                    ? `border-${window.api.getColor()}-500`
                    : "border-bg-color-3"
                } p-2 flex items-center gap-2`}
                onClick={() => handleChange("language", "en")}
              >
                <i className={`fi fi-us fis scale-125 rounded-full`} />
                English
              </button>
              <button
                className={`rounded-lg border bg-primary-500 ${
                  updatedSettings.language === "ar"
                    ? `border-${window.api.getColor()}-500`
                    : "border-bg-color-3"
                } p-2 flex items-center gap-2`}
                onClick={() => handleChange("language", "ar")}
              >
                <i className={`fi fi-sa fis scale-125 rounded-full`} />
                العربية
              </button>
            </div>
          </div>

          <div
            id="setting-calculationMethod"
            data-section="prayer_times"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>
              {t("calculation_method")}
            </h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("calculation_method_description")}
            </p>
            <div className={`flex flex-row flex-wrap gap-2 text-ellipsis w-fit relative`}>
              <BsChevronDown size={16} className="absolute end-3 top-1/2 transform -translate-y-1/2" />
              <select
                className={`rounded-lg appearance-none focus:outline-none border bg-bg-color border-bg-color-3 p-2 px-4 text-ellipsis w-64`}
                value={updatedSettings.calculationMethod}
                onChange={(e) =>
                  handleChange("calculationMethod", e.target.value)
                }
              >
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {t(method)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            id="setting-adhan_notifications"
            data-section="prayer_times"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>
              {t("adhan_notifications")}
            </h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("adhan_notifications_description")}
            </p>
            <div className="flex flex-row items-center gap-4">
              <button
                onClick={() =>
                  handleChange(
                    "adhan_notifications",
                    !updatedSettings.adhan_notifications
                  )
                }
                className={`w-16 h-8 transition-all ${
                  updatedSettings.adhan_notifications
                    ? `bg-${window.api.getColor()}-500 border-${window.api.getColor()}-500`
                    : "bg-bg-color-2 border-bg-color-3"
                } rounded-full border flex items-center justify-center relative`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-text transition-all ${
                    updatedSettings.adhan_notifications ? "ms-8" : "me-8"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Location Section */}
          <div
            id="setting-location"
            data-section="location"
            className="flex flex-col p-2 rounded-md transition-colors col-span-2"
          >
            <h2 className="text-lg font-medium text-start">{t("location")}</h2>
            <p className="text-sm text-start text-text-2 pt-1 pb-2">
              {t("location_description", "Search and select your city for accurate prayer times")}
            </p>
            
            <div className="w-full">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                currentLocation={currentLocation}
                theme={updatedSettings.theme}
              />
            </div>
            {/* add attribution to nominatim.openstreetmap */}
            <p className="text-sm text-start text-text-2 p-4 absolute bottom-0 end-0">
              {t("attribution_location")} {" "}
              <button onClick={() => window.api.openURL("https://www.openstreetmap.org/copyright")} className="text-text-2 underline">
                OpenStreetMap
              </button>
            </p>
          </div>

          <div
            id="setting-minimize_to_tray"
            data-section="app_settings"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>
              {t("minimize_to_tray")}
            </h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("minimize_to_tray_description")}
            </p>
            <div className="flex flex-row items-center gap-4">
              <button
                onClick={() =>
                  handleChange(
                    "minimize_to_tray",
                    !updatedSettings.minimize_to_tray
                  )
                }
                className={`w-16 h-8 transition-all ${
                  updatedSettings.minimize_to_tray
                    ? `bg-${window.api.getColor()}-500 border-${window.api.getColor()}-500`
                    : "bg-bg-color-2 border-bg-color-3"
                } rounded-full border flex items-center justify-center relative`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-text transition-all ${
                    updatedSettings.minimize_to_tray ? "ms-8" : "me-8"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div
            id="setting-run_on_startup"
            data-section="app_settings"
            className={`flex flex-col p-2 rounded-md transition-colors`}
          >
            <h2 className={`text-lg font-medium text-start`}>
              {t("run_on_startup")}
            </h2>
            <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
              {t("run_on_startup_description")}
            </p>
            <div className="flex flex-row items-center gap-4">
              <button
                onClick={() =>
                  handleChange(
                    "run_on_startup",
                    !updatedSettings.run_on_startup
                  )
                }
                className={`w-16 h-8 transition-all ${
                  updatedSettings.run_on_startup
                    ? `bg-${window.api.getColor()}-500 border-${window.api.getColor()}-500`
                    : "bg-bg-color-2 border-bg-color-3"
                } rounded-full border flex items-center justify-center relative`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-text transition-all ${
                    updatedSettings.run_on_startup ? "ms-8" : "me-8"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          <div
            className={`flex flex-row justify-between items-center gap-4 p-4 bg-${window.api.getColor()}-500/25 backdrop-blur-lg text-text fixed start-20 bottom-4 rounded-lg w-[calc(100%-6rem)] ${
              settingsChanged ? "slideUp" : "slideDown"
            }`}
          >
            <div className={`flex flex-col p-2 rounded-md transition-colors`}>
              <h1 className={`text-lg font-medium text-start`}>
                {t("settings_changed")}
              </h1>
              <p className={`text-sm font-normal text-start text-text-2`}>
                {t("app_will_reload")}
              </p>
            </div>
            <div className={`flex flex-row gap-4`}>
              <button
                className={`bg-green-700 p-2 rounded-lg text-white px-4`}
                onClick={applySettings}
              >
                {t("yes")}
              </button>
              <button
                className={`bg-red-700 p-2 rounded-lg text-white px-4`}
                onClick={discardChanges}
              >
                {t("no")}
              </button>
            </div>
          </div>
        </div>
        <div
          className="p-4 mt-4 bg-bg-color-2 rounded-lg shadow-sm"
          data-section="app_settings"
        >
          <div>
            <h2 className="text-lg font-medium text-start">{t("version")}</h2>
            <p className="text-sm text-start text-text-2 pt-1 pb-2">{window.api.getAppVersion()}</p>
            <hr className="pb-4 border-bg-color-3" />
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates}
              className={`flex items-center justify-center w-full md:w-auto bg-${window.api.getColor()}-500 text-white py-2 px-4 rounded-md hover:bg-${window.api.getColor()}-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCheckingUpdates ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("checking_for_updates", "Checking for updates...")}
                </>
              ) : (
                t("check_for_updates")
              )}
            </button>

            {/* Status message */}
            {updateStatus &&
              (() => {
                const statusMsg = getUpdateStatusMessage();
                return statusMsg ? (
                  <div
                    className={`mt-2 text-sm text-${statusMsg.color}-500 flex gap-1 items-center`}
                  >
                    <IconInfoCircle size={16} className="mr-1" />
                    {statusMsg.text}
                  </div>
                ) : null;
              })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
