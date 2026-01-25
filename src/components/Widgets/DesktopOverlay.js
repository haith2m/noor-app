import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconX, IconCheck } from "@tabler/icons-react";

function DesktopOverlay({ widget, onPlace, onCancel, isDesktopOverlay = false }) {
  const { t } = useTranslation();
  const [gridSize, setGridSize] = useState({ cols: 12, rows: 12 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [existingWidgets, setExistingWidgets] = useState([]);
  const [wallpaperPath, setWallpaperPath] = useState(null);
  const [wallpaperDataUrl, setWallpaperDataUrl] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!widget) return;

    // Calculate grid size based on screen dimensions
    const screenWidth = window.screen?.width || window.innerWidth;
    const screenHeight = window.screen?.height || window.innerHeight;
    
    // Use a reasonable grid cell size (120px per cell for bigger widgets)
    const cellSize = 120;
    const cols = Math.max(12, Math.floor(screenWidth / cellSize));
    const rows = Math.max(12, Math.floor(screenHeight / cellSize));
    
    setGridSize({ cols, rows });
    
    // Load existing widgets to check for overlaps
    const widgets = window.api.getWidgets?.() || [];
    setExistingWidgets(widgets);

    // Get desktop wallpaper if this is a desktop overlay
    if (isDesktopOverlay) {
      // Try to get as data URL first (more reliable in Electron)
      if (window.api?.getDesktopWallpaperDataUrl) {
        window.api.getDesktopWallpaperDataUrl().then((dataUrl) => {
          if (dataUrl) {
            setWallpaperDataUrl(dataUrl);
          } else {
            // Fallback to path if data URL fails
            if (window.api?.getDesktopWallpaper) {
              window.api.getDesktopWallpaper().then((path) => {
                if (path) {
                  setWallpaperPath(path);
                }
              }).catch((error) => {
                console.error("Error getting desktop wallpaper path:", error);
              });
            }
          }
        }).catch((error) => {
          console.error("Error getting desktop wallpaper as data URL:", error);
          // Fallback to path
          if (window.api?.getDesktopWallpaper) {
            window.api.getDesktopWallpaper().then((path) => {
              if (path) {
                setWallpaperPath(path);
              }
            }).catch((pathError) => {
              console.error("Error getting desktop wallpaper path:", pathError);
            });
          }
        });
      } else if (window.api?.getDesktopWallpaper) {
        // Fallback to path method
        window.api.getDesktopWallpaper().then((path) => {
          if (path) {
            setWallpaperPath(path);
          }
        }).catch((error) => {
          console.error("Error getting desktop wallpaper:", error);
        });
      }
    }
  }, [widget, isDesktopOverlay]);

  // Handle ESC key to cancel overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onCancel]);

  // Check if a position overlaps with any existing widget (with 1x1 grid safety space)
  const isPositionOccupied = (x, y, width, height) => {
    return existingWidgets.some((existingWidget) => {
      // Add 1x1 grid safety space around existing widget
      const safetySpace = 1;
      const existingLeft = Math.max(0, existingWidget.x - safetySpace);
      const existingTop = Math.max(0, existingWidget.y - safetySpace);
      const existingRight = existingWidget.x + existingWidget.width + safetySpace;
      const existingBottom = existingWidget.y + existingWidget.height + safetySpace;
      
      const newRight = x + width;
      const newBottom = y + height;
      
      // Check for overlap: rectangles overlap if one is not completely to the left, right, above, or below the other
      return !(
        x >= existingRight ||           // New widget is to the right of existing (with safety space)
        newRight <= existingLeft ||     // New widget is to the left of existing (with safety space)
        y >= existingBottom ||           // New widget is below existing (with safety space)
        newBottom <= existingTop         // New widget is above existing (with safety space)
      );
    });
  };

  const handleCellClick = (x, y) => {
    // Check if widget fits at this position and is not occupied
    if (
      x + widget.width <= gridSize.cols && 
      y + widget.height <= gridSize.rows &&
      !isPositionOccupied(x, y, widget.width, widget.height)
    ) {
      setSelectedPosition({ x, y });
    }
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onPlace(selectedPosition);
    }
  };

  const getWidgetPreviewStyle = (x, y) => {
    if (x === null || y === null) return null;
    
    const cellSize = 120;
    const screenWidth = window.screen?.width || window.innerWidth || 1920;
    const screenHeight = window.screen?.height || window.innerHeight || 1080;
    const gridCols = Math.max(12, Math.floor(screenWidth / cellSize));
    const gridRows = Math.max(12, Math.floor(screenHeight / cellSize));
    
    const left = (x / gridCols) * screenWidth;
    const top = (y / gridRows) * screenHeight;
    const width = (widget.width / gridCols) * screenWidth;
    const height = (widget.height / gridRows) * screenHeight;
    
    return { 
      left: `${left}px`, 
      top: `${top}px`, 
      width: `${width}px`, 
      height: `${height}px` 
    };
  };

  const handleMouseMove = (e) => {
    const cellSize = 120;
    const screenWidth = window.screen?.width || window.innerWidth;
    const screenHeight = window.screen?.height || window.innerHeight;
    const gridCols = Math.max(12, Math.floor(screenWidth / cellSize));
    const gridRows = Math.max(12, Math.floor(screenHeight / cellSize));
    
    const x = Math.floor((e.clientX / screenWidth) * gridCols);
    const y = Math.floor((e.clientY / screenHeight) * gridRows);
    
    // Check if widget fits at this position and is not occupied
    if (
      x + widget.width <= gridCols && 
      y + widget.height <= gridRows && 
      x >= 0 && 
      y >= 0 &&
      !isPositionOccupied(x, y, widget.width, widget.height)
    ) {
      setHoveredCell({ x, y });
    } else {
      setHoveredCell(null);
    }
  };

  const handleClick = (e) => {
    if (hoveredCell) {
      handleCellClick(hoveredCell.x, hoveredCell.y);
    }
  };

  // Build background style for desktop overlay
  const getBackgroundStyle = () => {
    if (isDesktopOverlay) {
      // Prefer data URL (more reliable)
      if (wallpaperDataUrl) {
        return {
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundImage: `url("${wallpaperDataUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      }
      
      // Fallback to file path
      if (wallpaperPath) {
        // Convert path to file:// URL format for Electron
        let wallpaperUrl;
        if (wallpaperPath.startsWith('http://') || wallpaperPath.startsWith('https://') || wallpaperPath.startsWith('file://')) {
          wallpaperUrl = wallpaperPath;
        } else {
          // Normalize path separators
          let normalizedPath = wallpaperPath.replace(/\\/g, '/');
          
          // Handle Windows paths (C:/path/to/file)
          if (normalizedPath.match(/^[A-Za-z]:/)) {
            // Windows path: file:///C:/path/to/file (three slashes)
            wallpaperUrl = `file:///${normalizedPath}`;
          } else if (normalizedPath.startsWith('/')) {
            // Unix/Mac absolute path: file:///path/to/file
            wallpaperUrl = `file://${normalizedPath}`;
          } else {
            // Relative path: file:///path/to/file
            wallpaperUrl = `file:///${normalizedPath}`;
          }
        }
        
        return {
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundImage: `url("${wallpaperUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      }
    }
    
    return isDesktopOverlay ? {
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
    } : {};
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 ${
        isDesktopOverlay 
          ? wallpaperPath 
            ? "" 
            : "bg-black/40"
          : "bg-black/80"
      } flex items-center justify-center`}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onCancel();
        }
      }}
      style={getBackgroundStyle()}
    >
      <div 
        className="relative w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* Show existing widgets as occupied areas */}
        {existingWidgets.map((existingWidget) => {
          const cellSize = 120;
          const screenWidth = window.screen?.width || window.innerWidth || 1920;
          const screenHeight = window.screen?.height || window.innerHeight || 1080;
          const gridCols = Math.max(12, Math.floor(screenWidth / cellSize));
          const gridRows = Math.max(12, Math.floor(screenHeight / cellSize));
          
          const left = (existingWidget.x / gridCols) * screenWidth;
          const top = (existingWidget.y / gridRows) * screenHeight;
          const width = (existingWidget.width / gridCols) * screenWidth;
          const height = (existingWidget.height / gridRows) * screenHeight;
          
          return (
            <div
              key={existingWidget.id}
              className="absolute border-2 border-red-500/60 rounded-lg bg-red-500/20 pointer-events-none"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                pointerEvents: "none",
              }}
            />
          );
        })}
        
        {/* Widget preview overlay */}
        {hoveredCell && (
          <div
            className={`absolute border-2 border-${window.api.getColor()}-500/50 rounded-lg bg-${window.api.getColor()}-500/10 transition-all pointer-events-none`}
            style={{
              ...getWidgetPreviewStyle(hoveredCell.x, hoveredCell.y),
              pointerEvents: "none",
            }}
          />
        )}
        
        {selectedPosition && (
          <div
            className={`absolute border-2 border-${window.api.getColor()}-500 rounded-lg bg-${window.api.getColor()}-500/20 transition-all pointer-events-none`}
            style={{
              ...getWidgetPreviewStyle(selectedPosition.x, selectedPosition.y),
              pointerEvents: "none",
            }}
          />
        )}

        {/* Instructions */}
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${
          isDesktopOverlay 
            ? "bg-white/95 dark:bg-gray-900/95 border-gray-300 dark:border-gray-700" 
            : "bg-bg-color-2 border-bg-color-3"
        } border rounded-lg p-4 shadow-lg z-10 max-w-md`}>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className={`${
                isDesktopOverlay 
                  ? "text-gray-900 dark:text-gray-100" 
                  : "text-text"
              } text-xl font-medium mb-1`}>
                {t("select_widget_position")}
              </h3>
              <p className={`text-sm ${
                isDesktopOverlay 
                  ? "text-gray-600 dark:text-gray-400" 
                  : "text-text-2"
              }`}>
                {t("widget_size")}: {widget.width} × {widget.height} {t("grid_units")}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedPosition && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm();
                  }}
                  className={`px-4 py-2 bg-${window.api.getColor()}-500 text-white rounded-lg hover:bg-${window.api.getColor()}-600 transition-all flex items-center gap-2 active:scale-95`}
                >
                  <IconCheck size={18} />
                  {t("confirm")}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className={`px-4 py-2 ${
                  isDesktopOverlay 
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" 
                    : "bg-bg-color-3 text-text hover:bg-bg-color-3/80"
                } rounded-lg transition-all flex items-center gap-2 active:scale-95`}
              >
                <IconX size={18} />
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>

        {/* Selected position info */}
        {selectedPosition && (
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 ${
            isDesktopOverlay 
              ? "bg-white/95 dark:bg-gray-900/95" 
              : "bg-bg-color-2"
          } border border-${window.api.getColor()}-500 rounded-lg p-3 shadow-lg z-10`}>
            <p className={`text-sm font-medium ${
              isDesktopOverlay 
                ? "text-gray-900 dark:text-gray-100" 
                : "text-text"
            }`}>
              {t("selected_position")}: ({selectedPosition.x}, {selectedPosition.y})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DesktopOverlay;

