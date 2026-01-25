import { useEffect, useState } from "react";
import WidgetRenderer from "./WidgetRenderer";

function DesktopWidgets() {
  const [widgets, setWidgets] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load widgets from storage
    const loadWidgets = () => {
      try {
        if (!window.api || !window.api.getWidgets) {
          setIsReady(true);
          return;
        }
        
        const savedWidgets = window.api.getWidgets() || [];
        
        // Only update if widgets actually changed (compare by ID and count)
        setWidgets(prevWidgets => {
          const prevIds = prevWidgets.map(w => w.id).sort().join(',');
          const newIds = savedWidgets.map(w => w.id).sort().join(',');
          
          // If IDs are the same, don't update (prevents unnecessary re-renders)
          if (prevIds === newIds && prevWidgets.length === savedWidgets.length) {
            return prevWidgets;
          }
          
          return savedWidgets;
        });
        
        setIsReady(true);
      } catch (error) {
        console.error("Error loading widgets:", error);
        setIsReady(true);
      }
    };

    // Initial load with a small delay to ensure API is ready
    const timeout = setTimeout(() => {
      loadWidgets();
    }, 500);

    // Check for updates periodically (less frequently to reduce re-renders)
    const interval = setInterval(() => {
      loadWidgets();
    }, 5000); // Changed from 2000 to 5000ms

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Make body transparent
  useEffect(() => {
    document.body.style.backgroundColor = "transparent";
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
        backgroundColor: "transparent",
      }}
    >
      
      {widgets.map((widget) => {
        return (
          <div
            key={widget.id}
            style={{
              pointerEvents: "auto",
              position: "relative",
            }}
          >
            <WidgetRenderer widget={widget} />
          </div>
        );
      })}
    </div>
  );
}

export default DesktopWidgets;

