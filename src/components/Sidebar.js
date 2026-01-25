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
  IconLayoutGrid,
  IconLayoutGridFilled,
} from "@tabler/icons-react";
import AppIcon from "./AppIcon";

function Sidebar() {
  const { currentPage, setCurrentPage } = usePage();
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);

  const pages = [
    {
      name: "home",
      condition: currentPage === "home",
      icon: currentPage.includes("home") ? (
        <IconHomeFilled size={24} />
      ) : (
        <IconHome size={24} />
      ),
    },
    {
      name: "quran-audio",
      condition: currentPage.startsWith("quran-audio") || currentPage.startsWith("playlist-"),
      icon: currentPage.startsWith("quran-audio") || currentPage.startsWith("playlist-") ? (
        <IconHeadphonesFilled size={24} />
      ) : (
        <IconHeadphones size={24} />
      ),
    },
    {
      name: "quran",
      condition: currentPage === "quran",
      icon:
        currentPage === "quran" ? (
          <IconBookFilled size={24} />
        ) : (
          <IconBook size={24} />
        ),
    },
    {
      name: "azkar",
      condition: currentPage.includes("azkar"),
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
      condition: currentPage.includes("calendar"),
      icon: currentPage.includes("calendar") ? (
        <IconCalendarFilled size={24} />
      ) : (
        <IconCalendar size={24} />
      ),
    },
    {
      name: "widgets",
      condition: currentPage === "widgets",
      icon: currentPage === "widgets" ? (
        <IconLayoutGridFilled size={24} />
      ) : (
        <IconLayoutGrid size={24} />
      ),
    },
  ];

  useEffect(() => {
    window.api.setPage(currentPage);
  }, [currentPage]);

  return (
    <>
      <div
        className={`w-16 select-none flex flex-col items-center justify-between h-screen fixed bg-bg-color-2 border-e border-bg-color-3 p-4 slideIn z-50`}
      >
        <div className={`flex flex-col gap-2`}>
          <div className={`w-12 h-12 flex items-center justify-center`}>
            <AppIcon />
          </div>
          {pages.map(({ name, icon, condition }) => {
            return (
              <div key={name}>
                <button
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    condition
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
