// Utility functions for widget styling based on widget settings

export const getWidgetColor = () => {
  const widgetColor = window.api.getWidgetColor?.() || window.api.getColor() || "green";
  // Return the actual color (monochrome is now a theme, not a color)
  return widgetColor;
};

export const getWidgetTheme = () => {
  return window.api.getWidgetTheme?.() || "light";
};

export const getWidgetSettings = () => {
  return window.api.getWidgetSettings?.() || {
    theme: "light",
    color: "green",
    borderRadius: 12,
    backgroundOpacity: 100,
  };
};

export const getWidgetStyles = () => {
  const settings = getWidgetSettings();
  const color = settings.color;
  const opacity = settings.backgroundOpacity / 100;
  
  // Define theme colors based on widget theme (not app theme)
  const themeColors = {
    light: {
      bgColor2: "#eaeaea",
      bgColor3: "#e1e1e1",
      text: "#0f0f0f",
      text2: "#6b6b6b",
    },
    dark: {
      bgColor2: "#1a1a1a",
      bgColor3: "#262626",
      text: "#fff",
      text2: "#b0b0b0",
    },
    monochrome: {
      // For monochrome theme, use shades of the selected color
      // We'll calculate these dynamically based on the color
      bgColor2: null, // Will be calculated
      bgColor3: null, // Will be calculated
      text: null, // Will be calculated
      text2: null, // Will be calculated
    },
  };
  
  // Get base colors for the theme
  let colors = themeColors[settings.theme] || themeColors.light;
  
  // If monochrome theme, calculate colors based on selected color shades
  if (settings.theme === "monochrome") {
    // Use darker Tailwind color shades for monochrome theme
    // Using darker shades: 800-900 for backgrounds, lighter shades (100-300) for text for contrast
    const colorShades = {
      green: { bg2: "#166534", bg3: "#14532d", text: "#dcfce7", text2: "#bbf7d0" }, // green-800, green-900, green-100, green-200
      blue: { bg2: "#1e3a8a", bg3: "#1e40af", text: "#dbeafe", text2: "#bfdbfe" }, // blue-800, blue-800, blue-100, blue-200
      red: { bg2: "#991b1b", bg3: "#7f1d1d", text: "#fee2e2", text2: "#fecaca" }, // red-800, red-900, red-100, red-200
      yellow: { bg2: "#854d0e", bg3: "#713f12", text: "#fef9c3", text2: "#fef08a" }, // yellow-800, yellow-800, yellow-100, yellow-200
      purple: { bg2: "#6b21a8", bg3: "#581c87", text: "#f3e8ff", text2: "#e9d5ff" }, // purple-800, purple-900, purple-100, purple-200
    };
    
    const shades = colorShades[color] || colorShades.green;
    colors = {
      bgColor2: shades.bg2,
      bgColor3: shades.bg3,
      text: shades.text,
      text2: shades.text2,
    };
  }
  
  // Convert hex to rgba with opacity (shared helper)
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Calculate background color with opacity
  const getBackgroundColor = () => {
    if (opacity === 1) {
      return colors.bgColor2; // Full opacity - use theme color directly
    }
    return hexToRgba(colors.bgColor2, opacity);
  };
  
  const getBorderColor = () => {
    if (opacity === 1) {
      return colors.bgColor3; // Full opacity - use theme color directly
    }
    return hexToRgba(colors.bgColor3, opacity);
  };
  
  // CSS custom properties for widget theme - these will cascade to children
  const widgetThemeVars = {
    '--bg-color-2': colors.bgColor2,
    '--bg-color-3': colors.bgColor3,
    '--text': colors.text,
    '--text-2': colors.text2,
  };
  
  return {
    color: color,
    theme: settings.theme,
    borderRadius: `${settings.borderRadius}px`,
    backgroundOpacity: opacity,
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    textColor: colors.text,
    textColor2: colors.text2,
    // CSS custom properties for widget theme - directly override global vars
    widgetThemeVars: widgetThemeVars,
    backgroundStyle: {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      color: colors.text,
      ...widgetThemeVars,
    },
    colorClass: `text-${color}-500`,
  };
};

export const getWidgetColorClass = (shade = "500") => {
  const settings = getWidgetSettings();
  const color = settings.color;
  
  // For monochrome theme, use different shades of the color
  if (settings.theme === "monochrome") {
    // Use varying shades for monochrome theme
    // Primary elements use 500, secondary use 400, tertiary use 600
    return `text-${color}-${shade}`;
  }
  
  return `text-${color}-${shade}`;
};

// Get color shade for monochrome theme elements
export const getMonochromeShade = (elementType = "primary") => {
  const settings = getWidgetSettings();
  if (settings.theme !== "monochrome") {
    return "500"; // Default shade for non-monochrome
  }
  
  // Return different darker shades for different element types
  const shadeMap = {
    primary: "600",
    secondary: "500",
    tertiary: "700",
    accent: "800",
    muted: "400",
  };
  
  return shadeMap[elementType] || "600";
};

// Get widget color class with appropriate shade based on theme
export const getWidgetColorWithShade = (elementType = "primary") => {
  const settings = getWidgetSettings();
  const color = settings.color;
  const shade = settings.theme === "monochrome" ? getMonochromeShade(elementType) : "500";
  return `text-${color}-${shade}`;
};

// Get widget background color class with appropriate shade based on theme
export const getWidgetBgColorWithShade = (elementType = "primary", opacity = null) => {
  const settings = getWidgetSettings();
  const color = settings.color;
  const shade = settings.theme === "monochrome" ? getMonochromeShade(elementType) : "500";
  const opacityClass = opacity ? `/${opacity}` : "";
  return `bg-${color}-${shade}${opacityClass}`;
};


