import { useEffect, useRef } from 'react';
import { isElectron } from '../utils/webCompatibility';

const SoundPlayer = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    audioRef.current = audio;

    // Only set up IPC listener in Electron environment
    if (isElectron() && window.electron) {
      // Add event listener for play-sound events from main process
      window.electron.receive('play-adhan', (data) => {
      try {
        if (data) {
          console.log('Playing sound:', data);
          
          const audioPath = data.appPath || `file://${data.path}`;
          console.log('Using audio path:', audioPath);
          
          // Set the audio source
          audio.src = audioPath;
          
          // Play the audio with error handling
          audio.play().catch(err => {
            console.error('Error playing audio:', err);
            
            if (data.appPath && data.path) {
              console.log('Trying alternative path:', `file://${data.path}`);
              audio.src = `file://${data.path}`;
              audio.play().catch(alternativeErr => {
                console.error('Alternative method also failed:', alternativeErr);
              });
            }
          });
        }
      } catch (error) {
        console.error('Error handling play-adhan event:', error);
      }
      });
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default SoundPlayer; 