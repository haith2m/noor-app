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
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  isMaxmized: () => ipcRenderer.on("isMaxmized", (event, arg) => arg),
  close: () => {
    ipcRenderer.send(`close`);
  },
  sendNotification: (prayer) => ipcRenderer.send("notification", prayer),
  reloadPage: () => window.location.reload(),
  receive: (channel, func) => {
    const validChannels = ["reload-prayers", "play-adhan", "update-available", "update-downloaded", "update-check-result"];
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
  removeListener: (channel, func) => {
    const validChannels = ["reload-prayers", "play-adhan", "update-available", "update-downloaded", "update-check-result"];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, func);
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
