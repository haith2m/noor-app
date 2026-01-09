import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconX } from "@tabler/icons-react";

function CreatePlaylistModal({ isOpen, onClose, onSave, initialName = "" }) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
      onClose();
      setName("");
    }
  };

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
            {initialName ? t("edit_playlist") : t("create_playlist")}
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("playlist_name")}
          className="w-full bg-bg-color-3 border border-bg-color-3 text-text rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-text-2"
          autoFocus
        />
        <div className="flex justify-end gap-2">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-text-2 hover:bg-bg-color-3 transition-colors"
            >
                {t("cancel")}
            </button>
            <button
                onClick={handleSave}
                disabled={!name.trim()}
                className={`px-4 py-2 rounded-lg bg-${window.api.getColor()}-600 text-white hover:bg-${window.api.getColor()}-700 transition-colors disabled:opacity-50`}
            >
                {t("save")}
            </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylistModal;

