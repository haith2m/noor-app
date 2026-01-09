import React from "react";
import PlaylistSidebar from "./PlaylistSidebar";
import AudioQuran from "./AudioQuran";
import PlaylistView from "./PlaylistView";
import { usePage } from "../../PageContext";

const AudioLayout = () => {
  const { currentPage } = usePage();

  const renderContent = () => {
    if (currentPage.startsWith("playlist-")) {
        const playlistId = currentPage.split("-")[1];
        return <PlaylistView playlistId={playlistId} />;
    }
    
    // Default to AudioQuran
    if (currentPage.startsWith("quran-audio")) {
        const parts = currentPage.split("-");
        // quran-audio-RECITERID
        const reciterId = parts.length > 2 ? parts[2] : null;
        return <AudioQuran key={reciterId || "main-view"} Reciter={reciterId} />;
    }
    
    return null;
  };
  
  return (
     <div className="flex min-h-[calc(100vh-3.5rem)] w-full"> 
        <div className="flex-1 overflow-hidden h-full">
             {renderContent()}
        </div>
        <PlaylistSidebar /> 
     </div>
  );
};

export default AudioLayout;

