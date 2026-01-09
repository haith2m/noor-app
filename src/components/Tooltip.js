import React, { useState, useRef } from "react";

function Tooltip({ message, widthFull, children, positionAdd = "0" }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current?.offsetHeight || 40;
      const tooltipWidth = tooltipRef.current?.offsetWidth || 150;
      
      let top = rect.top - tooltipHeight - 4 - Number(positionAdd);
      let left = rect.left + rect.width / 2;

      // Check if tooltip goes off screen top
      if (top < 0) {
        top = rect.bottom + 4;
      }

      // Check if tooltip goes off screen left/right
      if (left - tooltipWidth / 2 < 4) {
        left = tooltipWidth / 2 + 4;
      } else if (left + tooltipWidth / 2 > window.innerWidth) {
        left = window.innerWidth - tooltipWidth / 2 - 4;
      }

      setPosition({ top, left });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className={`group relative flex max-w-max flex-col items-center justify-center ${widthFull ? "w-full" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      <div 
        ref={tooltipRef}
        className={`fixed z-[9999] -translate-x-1/2 rounded-lg drop-shadow-xl px-3 py-2 text-xs font-medium transition-opacity pointer-events-none ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex max-w-xs flex-col items-center">
          <div
            className={`rounded-lg bg-bg-color border border-bg-color-3 p-2 text-center text-sm text-text`}
          >
            {message && message.toString().split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tooltip;
