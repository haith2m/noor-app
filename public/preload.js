const { contextBridge, ipcRenderer } = require("electron");
const Store = require("electron-store");
const packageJson = require("../package.json");

const store = new Store();

contextBridge.exposeInMainWorld("api", {
  getSettings: () => {
    return store.get("settings") || {};
  },
  setSettings: (data) => {
    store.set("settings", data);
    window.location.reload();
  },
  setPage: (page) => {
    store.set("page", page);
  },
  getPage: () => {
    return store.get("page") || "home";
  },
  getColor: () => {
    return store.get("settings")?.color || "green";
  },
  isFavorite: (id) => {
    const favorites = store.get("favorites-reciters") || [];
    return favorites.includes(id);
  },
  toggleFavorite: (id) => {
    const favorites = store.get("favorites-reciters") || [];
    if (favorites.includes(id)) {
      store.set(
        "favorites-reciters",
        favorites.filter((item) => item !== id)
      );
    } else {
      store.set("favorites-reciters", [...favorites, id]);
    }
  },
  getFavorites: () => {
    return store.get("favorites-reciters") || [];
  },
  getPlaylists: () => {
    return store.get("playlists") || [];
  },
  savePlaylists: (playlists) => {
    store.set("playlists", playlists);
    ipcRenderer.send("playlists-updated");
  },
  onPlaylistsUpdated: (callback) => {
     ipcRenderer.on("playlists-updated", (event, playlists) => callback(playlists));
  },

  getLocationData: async () => {
    try {
      const cachedLocation = store.get("location");
      if (
        cachedLocation &&
        cachedLocation.language === (store.get("settings")?.language || "ar")
      )
        return cachedLocation;

      const ipInfo = await fetch("https://ipinfo.io/json");
      const ipInfoData = await ipInfo.json();
      const language = store.get("settings")?.language || "ar";
      const locationURL = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${ipInfoData.region}, ${ipInfoData.country}`
      )}&format=json&accept-language=${language}&addressdetails=1`;
      const locationResponse = await fetch(locationURL);
      const locationData = await locationResponse.json();
      const name = locationData[0].display_name;
      const [latitude, longitude] = ipInfoData.loc.split(",").map(parseFloat);
      const location = { name, latitude, longitude, language };
      store.set("location", location);
      return location;
    } catch (error) {
      console.error("Error fetching location data:", error);
      return null;
    }
  },
  getCurrentStoredLocation: () => {
    try {
      return store.get("location") || null;
    } catch (error) {
      console.error("Error getting stored location:", error);
      return null;
    }
  },
  setLocationData: (locationData) => {
    try {
      store.set("location", locationData);
      return true;
    } catch (error) {
      console.error("Error setting location data:", error);
      return false;
    }
  },
  clearLocationData: () => {
    try {
      store.delete("location");
      return true;
    } catch (error) {
      console.error("Error clearing location data:", error);
      return false;
    }
  },
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  isMaxmized: () => ipcRenderer.on("isMaxmized", (event, arg) => arg),
  close: () => {
    ipcRenderer.send(`close`);
  },
  sendNotification: (prayer) => ipcRenderer.send("notification", prayer),
  reloadPage: () => window.location.reload(),
  receive: (channel, func) => {
    const validChannels = ["reload-prayers", "play-adhan", "update-available", "update-downloaded", "update-check-result", "playlists-updated"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  getElectronVersion: () => process.versions.electron,
  openURL: (url) => ipcRenderer.send("open-url", url),
  getAppVersion: () => packageJson.version,
  getResourcePath: (resourceName) =>
    ipcRenderer.invoke("get-resource-path", resourceName),
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  restartAndUpdate: () => ipcRenderer.send("restart-app"),
  getAutoLaunchEnabled: () => ipcRenderer.invoke("get-auto-launch-enabled"),
  setAutoLaunch: (enabled) => ipcRenderer.invoke("set-auto-launch", enabled),
  // Progress tracking methods
  saveProgress: (reciterId, surahId, currentTime, duration) => 
    ipcRenderer.invoke("save-progress", reciterId, surahId, currentTime, duration),
  getProgress: (reciterId, surahId) => 
    ipcRenderer.invoke("get-progress", reciterId, surahId),
  getAllProgress: () => 
    ipcRenderer.invoke("get-all-progress"),
  clearProgress: (reciterId, surahId) => 
    ipcRenderer.invoke("clear-progress", reciterId, surahId),
  // Quran reading progress methods (per surah)
  saveQuranProgress: (surahId, page) => {
    try {
      if (!surahId || !page) {
        console.warn("saveQuranProgress: Missing surahId or page", { surahId, page });
        return false;
      }
      const progress = store.get("quran-progress") || {};
      // Ensure surahId is a string for consistent key storage
      const key = String(surahId);
      progress[key] = Number(page);
      store.set("quran-progress", progress);
      console.log("Progress saved:", { surahId: key, page, progress });
      return true;
    } catch (error) {
      console.error("Error saving Quran progress:", error);
      return false;
    }
  },
  getQuranProgress: (surahId) => {
    try {
      if (!surahId) return null;
      const progress = store.get("quran-progress") || {};
      // Ensure surahId is a string for consistent key lookup
      const key = String(surahId);
      return progress[key] || null;
    } catch (error) {
      console.error("Error getting Quran progress:", error);
      return null;
    }
  },
  getAllQuranProgress: () => {
    try {
      return store.get("quran-progress") || {};
    } catch (error) {
      console.error("Error getting all Quran progress:", error);
      return {};
    }
  },
  clearQuranProgress: (surahId) => {
    try {
      const progress = store.get("quran-progress") || {};
      if (surahId) {
        // Clear progress for specific surah
        const key = String(surahId);
        delete progress[key];
        store.set("quran-progress", progress);
      } else {
        // Clear all progress
        store.delete("quran-progress");
      }
      return true;
    } catch (error) {
      console.error("Error clearing Quran progress:", error);
      return false;
    }
  },
  // Widget storage methods
  getWidgets: () => {
    try {
      return store.get("widgets") || [];
    } catch (error) {
      console.error("Error getting widgets:", error);
      return [];
    }
  },
  saveWidgets: (widgets) => {
    try {
      store.set("widgets", widgets);
      return true;
    } catch (error) {
      console.error("Error saving widgets:", error);
      return false;
    }
  },
  // Widget settings methods
  getWidgetSettings: () => {
    try {
      return store.get("widget-settings") || {
        theme: "light",
        color: "green",
        borderRadius: 12,
        backgroundOpacity: 100,
      };
    } catch (error) {
      console.error("Error getting widget settings:", error);
      return {
        theme: "light",
        color: "green",
        borderRadius: 12,
        backgroundOpacity: 100,
      };
    }
  },
  setWidgetSettings: (settings) => {
    try {
      store.set("widget-settings", settings);
      return true;
    } catch (error) {
      console.error("Error saving widget settings:", error);
      return false;
    }
  },
  getWidgetColor: () => {
    try {
      const widgetSettings = store.get("widget-settings") || {};
      return widgetSettings.color || "green";
    } catch (error) {
      console.error("Error getting widget color:", error);
      return "green";
    }
  },
  getWidgetTheme: () => {
    try {
      const widgetSettings = store.get("widget-settings") || {};
      return widgetSettings.theme || "light";
    } catch (error) {
      console.error("Error getting widget theme:", error);
      return "light";
    }
  },
  // Desktop overlay methods
  showDesktopOverlay: (widgetData) => 
    ipcRenderer.invoke("show-desktop-overlay", widgetData),
  closeDesktopOverlay: () => 
    ipcRenderer.invoke("close-desktop-overlay"),
  sendWidgetPosition: (position) => 
    ipcRenderer.send("widget-position-selected", position),
  cancelWidgetOverlay: () => 
    ipcRenderer.send("widget-overlay-cancelled"),
  getDesktopWallpaper: () => 
    ipcRenderer.invoke("get-desktop-wallpaper"),
  getDesktopWallpaperDataUrl: () => 
    ipcRenderer.invoke("get-desktop-wallpaper-data-url"),
  onWidgetPositionSelected: (callback) => {
    ipcRenderer.on("widget-position-selected", (event, position) => callback(position));
  },
  // Widgets window methods
  showWidgetsWindow: () => 
    ipcRenderer.invoke("show-widgets-window"),
  closeWidgetsWindow: () => 
    ipcRenderer.invoke("close-widgets-window"),
  removeListener: (channel, func) => {
    const validChannels = ["reload-prayers", "play-adhan", "update-available", "update-downloaded", "update-check-result", "playlists-updated"];
    if (validChannels.includes(channel)) {
      if (func) {
        ipcRenderer.removeListener(channel, func);
      } else {
        ipcRenderer.removeAllListeners(channel);
      }
    }
  },
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = [
      "minimize",
      "maximize",
      "close",
      "isMaxmized",
      "open-url",
      "check-for-updates",
      "restart-app",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ["isMaxmized", "reload-prayers", "play-adhan", "update-available", "update-downloaded", "update-check-result"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  removeListener: (channel, func) => {
    const validChannels = ["isMaxmized", "reload-prayers", "play-adhan", "update-available", "update-downloaded", "update-check-result"];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
    }
  },
});
