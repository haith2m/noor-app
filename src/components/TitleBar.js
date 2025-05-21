import {
  IconCopy,
  IconMinus,
  IconSquare,
  IconX,
  IconSearch,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

function TitleBar({ onOpenSearch }) {
  const { t } = useTranslation();
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

  return (
    <div
      className="fixed w-[calc(100%-4rem)] end-0 h-10 bg-bg-color-2 z-50 flex justify-end border-b border-bg-color-3"
      onDoubleClick={handleDoubleClick}
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center w-3/4 mx-auto p-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center py-0.5 px-2 text-text bg-bg-color transition-colors rounded-md border border-bg-color-3 w-full"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <div className="ml-4 text-xs text-text-2 flex items-center gap-1 font-mono">
            <div className="bg-bg-color-2 border border-bg-color-3 rounded-md px-1 py-0.5">
              K
            </div>
            <div className="bg-bg-color-2 border border-bg-color-3 rounded-md px-1 py-0.5">
              CTRL
            </div>
          </div>
          <p className="text-xs text-text-2 flex items-center gap-1 me-0 w-full">
            {t("search")}
          </p>
          <IconSearch size={18} className="ms-auto" />
        </button>
      </div>

      <div className="flex items-center h-full">
        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-10 text-text hover:bg-black/10 transition-colors"
          title="Minimize"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <IconMinus size={24} />
        </button>

        {/* Maximize Button */}
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-10 h-10 text-text hover:bg-black/10 transition-colors"
          title="Maximize"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          {isMaxmized() ? <IconSquare size={16} /> : <IconCopy size={16} />}
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-10 text-text hover:bg-red-500 hover:text-white transition-colors"
          title="Close"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <IconX size={24} />
        </button>
      </div>
    </div>
  );
}

export default TitleBar;
