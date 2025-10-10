import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IconPlus, 
  IconPlaylist, 
  IconMusic,
  IconX,
} from '@tabler/icons-react';
import PlaylistModal from './PlaylistModal';
import PlaylistCard from './PlaylistCard';

const PlaylistManager = ({ isOpen, onClose, suwar, onPlayPlaylist }) => {
  const { t } = useTranslation();
  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [showPlaylists, setShowPlaylists] = useState(false);

  // Load playlists from localStorage on component mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    try {
      const savedPlaylists = window.api.getPlaylists();
      setPlaylists(savedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const savePlaylists = (updatedPlaylists) => {
    try {
      window.api.setPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      surahs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    savePlaylists(updatedPlaylists);
  };

  const updatePlaylist = (id, name) => {
    const updatedPlaylists = playlists.map(playlist => 
      playlist.id === id 
        ? { ...playlist, name, updatedAt: new Date().toISOString() }
        : playlist
    );
    savePlaylists(updatedPlaylists);
  };

  const deletePlaylist = (id) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
    savePlaylists(updatedPlaylists);
  };

  const removeSurahFromPlaylist = (playlistId, surahId) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          surahs: playlist.surahs.filter(s => s.id !== surahId),
          updatedAt: new Date().toISOString()
        };
      }
      return playlist;
    });
    savePlaylists(updatedPlaylists);
  };

  const handleCreatePlaylist = () => {
    setEditingPlaylist(null);
    setIsModalOpen(true);
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (name) => {
    if (editingPlaylist) {
      updatePlaylist(editingPlaylist.id, name);
    } else {
      createPlaylist(name);
    }
    setIsModalOpen(false);
    setEditingPlaylist(null);
  };

  const handlePlayPlaylist = (playlist) => {
    if (onPlayPlaylist) {
      onPlayPlaylist(playlist);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all fadeIn-300"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-bg-color border border-bg-color-3 p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden text-text">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <IconPlaylist className={`text-${window.api.getColor()}-500`} size={24} />
              <h2 className="text-xl font-semibold">{t('playlists')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPlaylists(!showPlaylists)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  showPlaylists 
                    ? `bg-${window.api.getColor()}-500 text-white` 
                    : 'bg-bg-color-3 text-text hover:bg-bg-color-2'
                }`}
              >
                {showPlaylists ? t('hide_playlists') : t('show_playlists')}
              </button>
              <button
                onClick={handleCreatePlaylist}
                className={`px-4 py-2 bg-${window.api.getColor()}-500 text-white rounded hover:bg-${window.api.getColor()}-600 transition-colors flex items-center gap-2`}
              >
                <IconPlus size={16} />
                {t('create_playlist')}
              </button>
              <button
                onClick={onClose}
                className="text-text-2 hover:text-text transition-colors"
              >
                <IconX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-text-2">
                <IconMusic size={48} className="mx-auto mb-4 text-text-2" />
                <p className="text-lg mb-2">{t('no_playlists')}</p>
                <p className="text-sm">{t('create_your_first_playlist')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onEdit={() => handleEditPlaylist(playlist)}
                    onDelete={() => deletePlaylist(playlist.id)}
                    onPlay={() => handlePlayPlaylist(playlist)}
                    showPlaylists={showPlaylists}
                    onRemoveSurah={removeSurahFromPlaylist}
                    suwar={suwar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlaylist(null);
        }}
        onSubmit={handleModalSubmit}
        playlist={editingPlaylist}
      />
    </>
  );
};

export default PlaylistManager;
