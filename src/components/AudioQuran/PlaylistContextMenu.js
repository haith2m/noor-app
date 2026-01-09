import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IconPencil, IconTrash } from "@tabler/icons-react";

function PlaylistContextMenu({ x, y, onClose, onEdit, onDelete, playlistName }) {
  const { t } = useTranslation();
  const menuRef = useRef(null);
  const [style, setStyle] = useState({ top: y, left: x, opacity: 0 });

  useLayoutEffect(() => {
      if (menuRef.current) {
          const rect = menuRef.current.getBoundingClientRect();
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;
          
          let newTop = y;
          let newLeft = x;
          
          // Horizontal check
          if (x + rect.width > winWidth) {
              newLeft = x - rect.width;
          }

          // Vertical check
          if (y + rect.height > winHeight) {
               newTop = y - rect.height;
          }

          setStyle({
              top: newTop,
              left: newLeft,
              opacity: 1
          });
      }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    // Use timeout to ensure we don't catch the initial click event that opened the menu
    const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] w-48 bg-bg-color-2 rounded-lg shadow-xl border border-bg-color-3 py-1 text-sm overflow-hidden"
      style={style}
    >
      <div className="px-3 py-2 border-b border-bg-color-3 mb-1">
          <span className="font-semibold text-text truncate block">{playlistName}</span>
      </div>
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full text-start px-3 py-2 flex items-center gap-2 hover:bg-bg-color-3 text-text transition-colors"
      >
        <IconPencil size={16} />
        {t("edit_playlist")}
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full text-start px-3 py-2 flex items-center gap-2 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors"
      >
        <IconTrash size={16} />
        {t("delete_playlist")}
      </button>
    </div>,
    document.body
  );
}

export default PlaylistContextMenu;
