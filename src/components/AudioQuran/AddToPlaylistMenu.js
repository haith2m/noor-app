import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconCheck, IconPlus, IconList } from "@tabler/icons-react";
import CreatePlaylistModal from "./CreatePlaylistModal";

function AddToPlaylistMenu({ isOpen, onClose, surahToAdd, position }) {
  const { t } = useTranslation();
  const menuRef = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadPlaylists = () => {
    const loaded = window.api.getPlaylists() || [];
    setPlaylists(loaded);
  };

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the create modal or its portal
      if (isCreateModalOpen) return;
      
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isCreateModalOpen]);

  const toggleInPlaylist = (playlist) => {
    if (!surahToAdd) return;

    const exists = (playlist.surahs || []).some(s => 
       s.surah.id === surahToAdd.surah.id && 
       s.reciter.id === surahToAdd.reciter.id
    );
    
    let updatedPlaylists;
    if (exists) {
        // Remove
        updatedPlaylists = playlists.map(p => {
            if (p.id === playlist.id) {
                return {
                    ...p,
                    surahs: (p.surahs || []).filter(s => !(s.surah.id === surahToAdd.surah.id && s.reciter.id === surahToAdd.reciter.id))
                };
            }
            return p;
        });
    } else {
        // Add
        updatedPlaylists = playlists.map(p => {
            if (p.id === playlist.id) {
                return {
                    ...p,
                    surahs: [...(p.surahs || []), surahToAdd]
                };
            }
            return p;
        });
    }
    
    setPlaylists(updatedPlaylists);
    window.api.savePlaylists(updatedPlaylists);
 };

 const handleCreatePlaylist = (name) => {
    const newPlaylist = {
        id: Date.now().toString(),
        name,
        surahs: [] // Optionally add the current surah immediately?
    };
    // For now just create empty, user can check it
    const updated = [...playlists, newPlaylist];
    window.api.savePlaylists(updated);
    setPlaylists(updated);
 };

  // Calculate position styles
  const style = position ? { top: position.top, left: position.left } : {};
  const [adjustedStyle, setAdjustedStyle] = useState(style);

  useEffect(() => {
    if (isOpen && position && menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        
        // Handle both top/left and x/y for compatibility
        const posTop = position.top ?? position.y ?? 0;
        const posLeft = position.left ?? position.x ?? 0;
        
        const newStyle = { top: posTop, left: posLeft };
        
        // Vertical check
        // Check if menu goes off screen bottom
        if (window.innerHeight - posTop < menuRect.height + 20) {
             newStyle.top = 'auto';
             newStyle.bottom = window.innerHeight - posTop + 10;
        } else {
             newStyle.top = posTop + 10;
        }

        // Horizontal check
        // If it's a small screen, center it or make it fit
        if (window.innerWidth < 640) {
             newStyle.left = Math.max(10, Math.min(posLeft, window.innerWidth - menuRect.width - 10));
        } 
        // Normal behavior: check if it goes off right edge
        else if (window.innerWidth - posLeft < menuRect.width + 20) {
             newStyle.left = posLeft - menuRect.width + 20; 
        }
        
        setAdjustedStyle(newStyle);
    }
  }, [isOpen, position]);

  const getColor = () => window.api.getColor();

  if (!isOpen) return null;

  return (
    <>
    <div
      ref={menuRef}
      className="fixed z-[9999] w-64 bg-bg-color-2 rounded-xl shadow-2xl border border-bg-color-3 overflow-hidden flex flex-col max-h-[400px]"
      style={adjustedStyle}
    >
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className={`w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-bg-color-3 text-text transition-colors border-b border-bg-color-3 font-medium`}
      >
        <div className={`p-1.5 rounded-full bg-${getColor()}-500/10 text-${getColor()}-500`}>
             <IconPlus size={16} />
        </div>
        {t("create_playlist")}
      </button>

      <div className="overflow-y-auto flex-1 p-2">
        {playlists.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-6 text-text-2 gap-2 opacity-60">
               <IconList size={32} stroke={1.5} />
               <span className="text-sm">{t("no_playlists")}</span>
           </div>
        ) : (
            playlists.map(playlist => {
                const isAdded = (playlist.surahs || []).some(s => 
                    surahToAdd && s.surah.id === surahToAdd.surah.id && 
                    s.reciter.id === surahToAdd.reciter.id
                );
                
                return (
                    <button
                        key={playlist.id}
                        onClick={() => toggleInPlaylist(playlist)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all mb-1 group ${
                             isAdded ? `bg-${getColor()}-500/10` : "hover:bg-bg-color-3"
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                             <IconList size={18} className={isAdded ? `text-${getColor()}-500` : "text-text-2 group-hover:text-text"} />
                             <span className={`truncate text-sm ${isAdded ? `font-medium text-${getColor()}-500` : "text-text"}`}>
                                 {playlist.name}
                             </span>
                        </div>
                        {isAdded && <IconCheck size={16} className={`text-${getColor()}-500`} />}
                    </button>
                );
            })
        )}
      </div>
    </div>
    
    <CreatePlaylistModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePlaylist}
    />
    </>
  );
}

export default AddToPlaylistMenu;
