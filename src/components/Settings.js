import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePage } from "../PageContext";
import Tooltip from "./Tooltip";
import { IconBrandGithub, IconInfoCircle } from "@tabler/icons-react";

const Settings = () => {
  const { t } = useTranslation();
  const { settings, editSettings } = usePage();

  const [updatedSettings, setUpdatedSettings] = useState(settings);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  useEffect(() => {
    setSettingsChanged(
      JSON.stringify(settings) !== JSON.stringify(updatedSettings)
    );
  }, [settings, updatedSettings]);

  useEffect(() => {
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

    // Check if there's a setting to highlight from search
    const highlightedSetting = localStorage.getItem("highlight");
    if (highlightedSetting) {
      // Scroll to the highlighted setting
      const settingElement = document.getElementById(
        `setting-${highlightedSetting}`
      );
      if (settingElement) {
        settingElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a temporary highlight class
        settingElement.classList.add(`bg-${window.api.getColor()}-500/20`);
        setTimeout(() => {
          settingElement.classList.remove(`bg-${window.api.getColor()}-500/20`);
        }, 2000);
      }
      // Clear the highlight after using it
      localStorage.removeItem("highlight");
    }

    // Cleanup function
    return () => {
      // Remove the event listener if possible
      if (window.api.removeListener) {
        window.api.removeListener("update-check-result");
      }
    };
  }, []);

  const handleChange = (key, value) => {
    setUpdatedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applySettings = () => {
    editSettings(updatedSettings);
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
      case 'checking':
        return { text: t('checking_for_updates', 'Checking for updates...'), color: 'blue' };
      case 'no-update':
        return { text: t('app_up_to_date', 'You are running the latest version'), color: 'green' };
      case 'dev-mode':
        return { text: t('updates_disabled_dev', 'Update checking is disabled in development mode'), color: 'yellow' };
      case 'error':
        return { text: t('update_check_failed', 'Failed to check for updates'), color: 'red' };
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

  return (
    <div
      className={`p-6 bg-transparent text-text min-h-screen transition-all fadeIn`}
    >
      <h1 className={`text-2xl font-medium text-start pb-4`}>
        {t("settings")}
      </h1>
      <div className="grid grid-cols-2 gap-8">
        <div
          id="setting-theme"
          className={`flex flex-col p-2 rounded-md transition-colors`}
        >
          <h2 className={`text-lg font-medium text-start`}>{t("theme")}</h2>
          <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
            {t("theme_description")}
          </p>
          <div className={`flex flex-row gap-2`}>
            <Tooltip message={t("light")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.theme === "light"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-white`}
                onClick={() => handleChange("theme", "light")}
              />
            </Tooltip>
            <Tooltip message={t("dark")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.theme === "dark"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-black`}
                onClick={() => handleChange("theme", "dark")}
              />
            </Tooltip>
          </div>
        </div>

        <div
          id="setting-color"
          className={`flex flex-col p-2 rounded-md transition-colors`}
        >
          <h2 className={`text-lg font-medium text-start`}>{t("color")}</h2>
          <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
            {t("color_description")}
          </p>
          <div className={`flex flex-row flex-wrap gap-2`}>
            <Tooltip message={t("green")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.color === "green"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-green-500`}
                onClick={() => handleChange("color", "green")}
              />
            </Tooltip>
            <Tooltip message={t("blue")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.color === "blue"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-blue-500`}
                onClick={() => handleChange("color", "blue")}
              />
            </Tooltip>
            <Tooltip message={t("red")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.color === "red"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-red-500`}
                onClick={() => handleChange("color", "red")}
              />
            </Tooltip>
            <Tooltip message={t("yellow")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.color === "yellow"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-yellow-500`}
                onClick={() => handleChange("color", "yellow")}
              />
            </Tooltip>
            <Tooltip message={t("purple")}>
              <button
                className={`w-8 h-8 rounded-full border-2 ${
                  updatedSettings.color === "purple"
                    ? `border-${window.api.getColor()}-500`
                    : "border-zinc-500"
                } bg-purple-500`}
                onClick={() => handleChange("color", "purple")}
              />
            </Tooltip>
          </div>
        </div>

        <div
          id="setting-language"
          className={`flex flex-col p-2 rounded-md transition-colors`}
        >
          <h2 className={`text-lg font-medium text-start`}>{t("language")}</h2>
          <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
            {t("language_description")}
          </p>
          <div className={`flex flex-row gap-2`}>
            <button
              className={`rounded-lg border-2 bg-primary-500 ${
                updatedSettings.language === "en"
                  ? `border-${window.api.getColor()}-500`
                  : "border-zinc-500"
              } p-2 flex items-center gap-2`}
              onClick={() => handleChange("language", "en")}
            >
              <i className={`fi fi-us fis scale-125 rounded-full`} />
              English
            </button>
            <button
              className={`rounded-lg border-2 bg-primary-500 ${
                updatedSettings.language === "ar"
                  ? `border-${window.api.getColor()}-500`
                  : "border-zinc-500"
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
          className={`flex flex-col p-2 rounded-md transition-colors`}
        >
          <h2 className={`text-lg font-medium text-start`}>
            {t("calculation_method")}
          </h2>
          <p className={`text-sm text-start text-text-2 pt-1 pb-2`}>
            {t("calculation_method_description")}
          </p>
          <div className={`flex flex-row flex-wrap gap-2`}>
            <select
              className={`rounded-lg border-2 bg-bg-color border-zinc-500 p-2 px-4`}
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
                  : "bg-bg-color-2 border-zinc-500"
              } rounded-full border-2 flex items-center justify-center relative`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-text transition-all ${
                  updatedSettings.adhan_notifications ? "ms-8" : "me-8"
                }`}
              ></div>
            </button>
          </div>
        </div>

        <div
          id="setting-minimize_to_tray"
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
                  : "bg-bg-color-2 border-zinc-500"
              } rounded-full border-2 flex items-center justify-center relative`}
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
      <div className="p-4 mt-4 bg-bg-color-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <IconInfoCircle size={20} />
          <h2 className="text-lg font-medium">{t("app_information")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-2">{t("version")}</p>
            <p className="font-medium">{window.api.getAppVersion()}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-2">{t("repository")}</p>
            <button
              onClick={() =>
                window.api.openURL("https://github.com/haith2m/noor-app")
              }
              className="flex items-center justify-center gap-2 text-primary text-center hover:text-primary/80"
            >
              <IconBrandGithub size={20} />
              <span>haith2m/noor-app</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-2">{t("license")}</p>
            <p className="font-medium">MIT License</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-2">{t("electron_version")}</p>
            <p className="font-medium">{window.api.getElectronVersion()}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-bg-color-3 pt-4">
          <button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates}
            className={`flex items-center justify-center w-full md:w-auto bg-${window.api.getColor()}-500 text-white py-2 px-4 rounded-md hover:bg-${window.api.getColor()}-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isCheckingUpdates ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('checking_for_updates', 'Checking for updates...')}
              </>
            ) : (
              t('check_for_updates')
            )}
          </button>
          
          {/* Status message */}
          {updateStatus && (() => {
            const statusMsg = getUpdateStatusMessage();
            return statusMsg ? (
              <div className={`mt-2 text-sm text-${statusMsg.color}-500 flex items-center`}>
                <IconInfoCircle size={16} className="mr-1" />
                {statusMsg.text}
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
