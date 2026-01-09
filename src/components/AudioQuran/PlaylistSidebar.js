import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconPlus, IconList } from "@tabler/icons-react";
import { usePage } from "../../PageContext";
import CreatePlaylistModal from "./CreatePlaylistModal";
import Tooltip from "../Tooltip";
import PlaylistContextMenu from "./PlaylistContextMenu";
import DeletePlaylistModal from "./DeletePlaylistModal";

function PlaylistSidebar() {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage } = usePage();
  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1100);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null); // { x, y, playlist }
  const [editingPlaylist, setEditingPlaylist] = useState(null); // Playlist object being edited
  const [deletingPlaylist, setDeletingPlaylist] = useState(null); // Playlist object being deleted

  const loadPlaylists = () => {
     const loaded = window.api.getPlaylists() || [];
     setPlaylists(loaded);
  };

  useEffect(() => {
    loadPlaylists();
    // Listen for updates
    window.api.receive("playlists-updated", loadPlaylists);
    
    const handleResize = () => {
        setIsCollapsed(window.innerWidth < 1100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
        window.api.removeListener("playlists-updated", loadPlaylists);
        window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleCreatePlaylist = (name) => {
    if (editingPlaylist) {
        // Update existing playlist
        const updated = playlists.map(p => 
            p.id === editingPlaylist.id ? { ...p, name } : p
        );
        window.api.savePlaylists(updated);
        setEditingPlaylist(null);
    } else {
        // Create new playlist
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            surahs: []
        };
        const updated = [...playlists, newPlaylist];
        window.api.savePlaylists(updated); 
    }
  };

  const handleContextMenu = (e, playlist) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      playlist
    });
  };

  const handleDeletePlaylist = (id) => {
    const playlistToDelete = playlists.find(p => p.id === id);
    if (playlistToDelete) {
        setDeletingPlaylist(playlistToDelete);
    }
  };

  const confirmDeletePlaylist = () => {
      if (deletingPlaylist) {
          const updated = playlists.filter(p => p.id !== deletingPlaylist.id);
          window.api.savePlaylists(updated);
          if (currentPage === `playlist-${deletingPlaylist.id}`) {
              setCurrentPage("quran-audio");
          }
          setDeletingPlaylist(null);
      }
  };

  const handleEditPlaylist = (playlist) => {
      setEditingPlaylist(playlist);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingPlaylist(null);
  };
  
  const getColor = () => window.api.getColor();

  return (
    <div style={{ overflow: "unset" }} className={`${isCollapsed ? "w-16 items-center" : "w-64"} transition-all bg-bg-color-2 border-s border-bg-color-3 h-[calc(100vh-2.5rem)] sticky top-10 flex-col pt-4 overflow-y-auto hidden md:flex shrink-0`}>
       <div className={`${isCollapsed ? "px-2" : "px-4"} flex-1`}>
           <div className={`flex items-center justify-between mb-2 ${isCollapsed ? "flex-col gap-2" : ""}`}>
               {!isCollapsed && <h3 className="text-text uppercase tracking-wider">{t("playlists")}</h3>}
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className={`p-1 rounded-md hover:bg-bg-color-3 text-text-2 hover:text-${getColor()}-500 transition-colors ${isCollapsed ? "w-10 h-10 flex items-center justify-center bg-bg-color-3" : ""}`}
                  title={isCollapsed ? t("create_playlist") : ""}
               >
                   <IconPlus size={isCollapsed ? 24 : 16} />
               </button>
           </div>
           <hr className="border-bg-color-3 my-2" />
           <div className={`flex flex-col gap-1 ${isCollapsed ? "items-center" : ""}`}>
               {playlists.map(playlist => (
                   isCollapsed ? (
                       <Tooltip message={playlist.name} key={playlist.id}>
                           <button
                               onClick={() => setCurrentPage(`playlist-${playlist.id}`)}
                               onContextMenu={(e) => handleContextMenu(e, playlist)}
                               className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                   currentPage === `playlist-${playlist.id}`
                                   ? `bg-${getColor()}-500/10 text-${getColor()}-500`
                                   : "text-text-2 hover:bg-bg-color-3 hover:text-text"
                               }`}
                           >
                               <IconList size={24} />
                           </button>
                       </Tooltip>
                   ) : (
                       <button
                           key={playlist.id}
                           onClick={() => setCurrentPage(`playlist-${playlist.id}`)}
                           onContextMenu={(e) => handleContextMenu(e, playlist)}
                           className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                               currentPage === `playlist-${playlist.id}`
                               ? `bg-${getColor()}-500/10 text-${getColor()}-500`
                               : "text-text-2 hover:bg-bg-color-3 hover:text-text"
                           }`}
                       >
                           <IconList size={20} />
                           <span className="truncate font-medium flex-1 text-start">{playlist.name}</span>
                           <span className="ms-auto text-xs opacity-60">{playlist.surahs?.length || 0}</span>
                       </button>
                   )
               ))}
           </div>
       </div>
       <CreatePlaylistModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          onSave={handleCreatePlaylist} 
          initialName={editingPlaylist ? editingPlaylist.name : ""}
       />
       {contextMenu && (
        <PlaylistContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          playlistName={contextMenu.playlist.name}
          onClose={() => setContextMenu(null)}
          onEdit={() => handleEditPlaylist(contextMenu.playlist)}
          onDelete={() => handleDeletePlaylist(contextMenu.playlist.id)}
        />
      )}
      <DeletePlaylistModal
          isOpen={!!deletingPlaylist}
          onClose={() => setDeletingPlaylist(null)}
          onConfirm={confirmDeletePlaylist}
          playlistName={deletingPlaylist?.name}
      />
    </div>
  );
}

export default PlaylistSidebar;

