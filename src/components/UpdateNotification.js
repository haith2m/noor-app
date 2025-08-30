import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCloudDownload, IconRefresh, IconX } from '@tabler/icons-react';
import { compatibleAPI } from "../utils/webCompatibility";

function UpdateNotification() {
  const { t } = useTranslation();
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Listen for update events from main process
    compatibleAPI.receive('update-available', () => {
      setShowNotification(true);
    });

    compatibleAPI.receive('update-downloaded', () => {
      setUpdateDownloaded(true);
      setShowNotification(true);
    });
  }, []);

  const handleClose = () => {
    setShowNotification(false);
  };

  const handleRestart = () => {
    compatibleAPI.restartAndUpdate();
  };

  const handleCheck = () => {
    compatibleAPI.checkForUpdates();
  };

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 bg-bg-color-2 border border-bg-color-3 rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-bg-color-3">
        <div className="flex items-center">
          <IconCloudDownload className={`text-${compatibleAPI.getColor()}-500 mr-2`} />
          <span className="font-medium text-text">
            {updateDownloaded ? t('update_ready', 'Update Ready') : t('update_available', 'Update Available')}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="text-text-2 hover:text-text"
        >
          <IconX size={18} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-text-2 mb-3">
          {updateDownloaded
            ? t('update_ready_message', 'A new version has been downloaded. Restart the application to apply the updates.')
            : t('update_available_message', 'A new version is available. The download will start automatically.')}
        </p>
        {updateDownloaded ? (
          <button
            onClick={handleRestart}
            className={`flex items-center justify-center w-full bg-${compatibleAPI.getColor()}-500 text-white py-2 px-4 rounded-md hover:bg-${compatibleAPI.getColor()}-600 transition-colors`}
          >
            <IconRefresh size={18} className="mr-2" />
            {t('restart_now', 'Restart Now')}
          </button>
        ) : (
          <button
            onClick={handleCheck}
            className={`flex items-center justify-center w-full bg-${compatibleAPI.getColor()}-500 text-white py-2 px-4 rounded-md hover:bg-${compatibleAPI.getColor()}-600 transition-colors`}
          >
            <IconCloudDownload size={18} className="mr-2" />
            {t('check_for_updates', 'Check for Updates')}
          </button>
        )}
      </div>
    </div>
  );
}

export default UpdateNotification; 