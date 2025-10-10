import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconPlus, IconMusic, IconX } from '@tabler/icons-react';

const PlaylistContextMenu = ({ 
  isOpen, 
  position, 
  onClose, 
  surah, 
  onAddToPlaylist,
  playlists,
  currentReciterId
}) => {
  const { t } = useTranslation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAddToPlaylist = (playlistId) => {
    onAddToPlaylist(playlistId, surah);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-bg-color border border-bg-color-3 rounded-lg shadow-lg py-2 min-w-[200px]"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-bg-color-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconMusic className={`text-${window.api.getColor()}-500`} size={16} />
            <span className="text-sm font-medium text-text">{t('add_to_playlist')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-2 hover:text-text transition-colors"
          >
            <IconX size={14} />
          </button>
        </div>
        <div className="text-xs text-text-2 mt-1 truncate" title={surah.name}>
          {surah.name}
        </div>
      </div>

      {/* Playlists List */}
      <div className="py-1">
        {playlists.length === 0 ? (
          <div className="px-3 py-4 text-center text-text-2 text-sm">
            <IconMusic size={24} className="mx-auto mb-2 opacity-50" />
            <p>{t('no_playlists')}</p>
            <p className="text-xs mt-1">{t('create_your_first_playlist')}</p>
          </div>
        ) : (
          playlists.map((playlist) => {
            const isInPlaylist = playlist.surahs.some(s => 
              s.id === surah.id && s.reciterId === currentReciterId
            );
            
            return (
              <button
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={isInPlaylist}
                className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                  isInPlaylist
                    ? 'text-text-2 cursor-not-allowed'
                    : 'text-text hover:bg-bg-color-3'
                }`}
                title={isInPlaylist ? t('already_in_playlist') : t('add_to_playlist')}
              >
                <IconPlus 
                  size={14} 
                  className={isInPlaylist ? 'text-text-2' : `text-${window.api.getColor()}-500`} 
                />
                <span className="truncate flex-1" title={playlist.name}>
                  {playlist.name}
                </span>
                {isInPlaylist && (
                  <span className="text-xs text-text-2">✓</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlaylistContextMenu;
