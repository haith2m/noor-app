import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconX, IconCheck } from '@tabler/icons-react';

const PlaylistModal = ({ isOpen, onClose, onSubmit, playlist }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (playlist) {
      setName(playlist.name);
    } else {
      setName('');
    }
    setError('');
  }, [playlist, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('playlist_name_required'));
      return;
    }

    if (name.trim().length < 2) {
      setError(t('playlist_name_too_short'));
      return;
    }

    onSubmit(name.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 transition-all fadeIn-300">
      <div className="bg-bg-color border border-bg-color-3 p-6 rounded-lg shadow-lg w-full max-w-md text-text">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {playlist ? t('edit_playlist') : t('create_playlist')}
          </h3>
          <button
            onClick={onClose}
            className="text-text-2 hover:text-text transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">
              {t('playlist_name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('enter_playlist_name')}
              className="w-full px-3 py-2 bg-bg-color-3 border border-bg-color-2 rounded-lg text-text placeholder-text-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              maxLength={50}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-color-3 text-text rounded hover:bg-bg-color-2 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-${window.api.getColor()}-500 text-white rounded hover:bg-${window.api.getColor()}-600 transition-colors flex items-center gap-2`}
            >
              <IconCheck size={16} />
              {playlist ? t('update') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;
