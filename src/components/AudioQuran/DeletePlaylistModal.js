import React from "react";
import { useTranslation } from "react-i18next";
import { IconX } from "@tabler/icons-react";

function DeletePlaylistModal({ isOpen, onClose, onConfirm, playlistName }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-bg-color-2 p-6 rounded-2xl w-96 shadow-xl border border-bg-color-3 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-text-2 hover:text-text"
        >
          <IconX size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-text">
            {t("delete_playlist")}
        </h2>

        <p className="text-text mb-6">
            {t("delete_playlist_confirm")} 
        </p>

        <div className="flex justify-center gap-2">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-text-2 hover:bg-bg-color-3 transition-colors"
            >
                {t("cancel")}
            </button>
            <button
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
                {t("delete")}
            </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePlaylistModal;

