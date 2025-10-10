import {
  IconCopy,
  IconMinus,
  IconSquare,
  IconX,
  IconHomeFilled,
  IconHeadphonesFilled,
  IconBookFilled,
  IconCalendarFilled,
  IconSettingsFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { usePage } from "../PageContext";
import AzkarIcon from "./AzkarIcon";

function TitleBar({ onOpenSearch }) {
  const { t } = useTranslation();
  const { currentPage } = usePage();
  const handleClose = () => {
    window.api.close();
  };

  const handleMinimize = () => {
    window.api.minimize();
  };

  const handleMaximize = () => {
    window.api.maximize();
  };

  const isMaxmized = () => {
    return window.api.isMaxmized();
  };

  const handleDoubleClick = () => {
    window.api.maximize();
  };

  const pages = [
    {
      name: "home",
      icon: <IconHomeFilled size={20} className="text-text-2" />,
    },
    {
      name: "quran-audio",
      icon: <IconHeadphonesFilled size={20} className="text-text-2" />,
    },
    {
      name: "quran",
      icon: <IconBookFilled size={20} className="text-text-2" />,
    },
    {
      name: "azkar",
      icon: <AzkarIcon filled={true} size={24} color={"text-text"} />,
    },
    {
      name: "calendar",
      icon: <IconCalendarFilled size={20} className="text-text-2" />,
    },
    {
      name: "settings",
      icon: <IconSettingsFilled size={20} className="text-text-2" />,
    },
  ];

  return (
    <div
      className="fixed w-[calc(100%-4rem)] end-0 h-10 bg-bg-color-2 z-50 flex justify-end border-b border-bg-color-3"
      onDoubleClick={handleDoubleClick}
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="flex items-center gap-2 w-fit mx-auto p-4 text-text-2 absolute left-0 right-0 top-0 bottom-0">
        {/* icon */}
        {pages.find((page) => 
          currentPage.startsWith(page.name) || 
          (currentPage === "playlist-view" && page.name === "quran-audio")
        )?.icon}
        <h1 className="text-lg mx-auto text-center">
          {t(
            currentPage.startsWith("quran-audio") || currentPage === "playlist-view"
              ? "audio_quran"
              : currentPage.startsWith("azkar-")
              ? "azkar"
              : currentPage.split("-")[0]
          )}
        </h1>
      </div>

      <div className="flex items-center h-full">
        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-10 text-text hover:bg-black/10 transition-colors"
          title="Minimize"
          style={{ WebkitAppRegion: "no-drag" }}
        >
          <IconMinus size={20} />
        </button>

        {/* Maximize Button */}
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-10 h-10 text-text hover:bg-black/10 transition-colors"
          title="Maximize"
          style={{ WebkitAppRegion: "no-drag" }}
        >
          {isMaxmized() ? <IconSquare size={16} /> : <IconCopy size={16} />}
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-10 text-text hover:bg-red-500 hover:text-white transition-colors"
          title="Close"
          style={{ WebkitAppRegion: "no-drag" }}
        >
          <IconX size={20} />
        </button>
      </div>
    </div>
  );
}

export default TitleBar;
