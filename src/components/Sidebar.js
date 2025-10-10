import { useEffect, useState } from "react";
import { usePage } from "../PageContext";
import AzkarIcon from "./AzkarIcon";
import WhatsNewModal from "./WhatsNewModal";
import {
  IconBook,
  IconBookFilled,
  IconHome,
  IconHomeFilled,
  IconSettings,
  IconSettingsFilled,
  IconCalendar,
  IconCalendarFilled,
  IconHeadphonesFilled,
  IconHeadphones,
  IconInfoCircle,
} from "@tabler/icons-react";
import AppIcon from "./AppIcon";

function Sidebar() {
  const { currentPage, setCurrentPage } = usePage();
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);

  const pages = [
    {
      name: "home",
      icon: currentPage.includes("home") ? (
        <IconHomeFilled size={24} />
      ) : (
        <IconHome size={24} />
      ),
    },
    {
      name: "quran-audio",
      icon: (currentPage.startsWith("quran-audio") || currentPage === "playlist-view") ? (
        <IconHeadphonesFilled size={24} />
      ) : (
        <IconHeadphones size={24} />
      ),
    },
    {
      name: "quran",
      icon:
        currentPage === "quran" ? (
          <IconBookFilled size={24} />
        ) : (
          <IconBook size={24} />
        ),
    },
    {
      name: "azkar",
      icon: (
        <AzkarIcon
          filled={currentPage.includes("azkar")}
          size={36}
          color={currentPage.includes("azkar") ? "text-green-500" : "text-text"}
        />
      ),
    },
    {
      name: "calendar",
      icon: currentPage.includes("calendar") ? (
        <IconCalendarFilled size={24} />
      ) : (
        <IconCalendar size={24} />
      ),
    },
  ];

  useEffect(() => {
    window.api.setPage(currentPage);
  }, [currentPage]);

  return (
    <>
      <div
        className={`w-16 select-none flex flex-col items-center justify-between h-screen fixed bg-bg-color-2 border-e border-bg-color-3 p-4 slideIn`}
      >
        <div className={`flex flex-col gap-2`}>
          <div className={`w-12 h-12 flex items-center justify-center`}>
            <AppIcon />
          </div>
          {pages.map(({ name, icon }) => {
            return (
              <div key={name}>
                <button
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    (name === "quran-audio" &&
                      currentPage.startsWith("quran-audio")) ||
                    (name === "quran" && currentPage === "quran") ||
                    (name !== "quran" &&
                      name !== "quran-audio" &&
                      currentPage.includes(name))
                      ? `bg-${window.api.getColor()}-500/20 text-${window.api.getColor()}-500`
                      : "bg-bg-color-3 text-text"
                  }`}
                  onClick={() => setCurrentPage(name)}
                >
                  {icon}
                </button>
                <hr className={`border-bg-color-3 mt-2`} />
              </div>
            );
          })}
        </div>
        <div className={`flex flex-col gap-2`}>
        <button
            className={`flex items-center justify-center text-${window.api.getColor()}-500 hover:bg-gray-300 dark:hover:bg-bg-color-2 transition-all mb-2`}
            onClick={() => setIsWhatsNewModalOpen(true)}
            title="What's New"
          >
            <IconInfoCircle size={24} />
          </button>
        <button
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            currentPage.startsWith("settings")
              ? `bg-${window.api.getColor()}-400/15 text-${window.api.getColor()}-500`
              : "bg-bg-color-3 text-text"
          }`}
          onClick={() => setCurrentPage("settings-appearance")}
        >
          {currentPage.startsWith("settings") ? (
            <IconSettingsFilled size={24} />
          ) : (
            <IconSettings size={24} />
          )}
        </button>
        </div>
      </div>

      <WhatsNewModal
        isOpen={isWhatsNewModalOpen}
        onClose={() => setIsWhatsNewModalOpen(false)}
      />
    </>
  );
}

export default Sidebar;
