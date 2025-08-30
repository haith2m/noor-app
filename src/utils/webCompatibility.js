// Web compatibility layer for Electron APIs
// This file provides a browser-compatible implementation of Electron APIs

const isElectron = () => {
  return typeof window !== 'undefined' && typeof window.api !== 'undefined';
};

// LocalStorage wrapper for web version
class WebStore {
  constructor() {
    this.prefix = 'noor_app_';
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }
}

const webStore = new WebStore();

// Create a compatible API object for web
const createWebAPI = () => ({
  getSettings: () => {
    if (isElectron()) {
      return window.api.getSettings();
    }
    return webStore.get('settings') || {};
  },
  
  setSettings: (data) => {
    if (isElectron()) {
      window.api.setSettings(data);
    } else {
      webStore.set('settings', data);
      window.location.reload();
    }
  },
  
  setPage: (page) => {
    if (isElectron()) {
      window.api.setPage(page);
    } else {
      webStore.set('page', page);
    }
  },
  
  getPage: () => {
    if (isElectron()) {
      return window.api.getPage();
    }
    return webStore.get('page') || 'home';
  },
  
  getColor: () => {
    if (isElectron()) {
      return window.api.getColor();
    }
    const settings = webStore.get('settings') || {};
    return settings.color || 'green';
  },
  
  isFavorite: (id) => {
    if (isElectron()) {
      return window.api.isFavorite(id);
    }
    const favorites = webStore.get('favorites-reciters') || [];
    return favorites.includes(id);
  },
  
  toggleFavorite: (id) => {
    if (isElectron()) {
      window.api.toggleFavorite(id);
    } else {
      const favorites = webStore.get('favorites-reciters') || [];
      if (favorites.includes(id)) {
        webStore.set('favorites-reciters', favorites.filter(item => item !== id));
      } else {
        webStore.set('favorites-reciters', [...favorites, id]);
      }
    }
  },
  
  getFavorites: () => {
    if (isElectron()) {
      return window.api.getFavorites();
    }
    return webStore.get('favorites-reciters') || [];
  },
  
  getLocationData: async () => {
    if (isElectron()) {
      return window.api.getLocationData();
    }
    
    // Web version location fetching
    try {
      const cachedLocation = webStore.get('location');
      const settings = webStore.get('settings') || {};
      const language = settings.language || 'ar';
      
      if (cachedLocation && cachedLocation.language === language) {
        return cachedLocation;
      }
      
      const ipInfo = await fetch('https://ipinfo.io/json');
      const ipInfoData = await ipInfo.json();
      
      const locationURL = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${ipInfoData.region}, ${ipInfoData.country}`
      )}&format=json&accept-language=${language}&addressdetails=1`;
      
      const locationResponse = await fetch(locationURL);
      const locationData = await locationResponse.json();
      const name = locationData[0].display_name;
      const [latitude, longitude] = ipInfoData.loc.split(',').map(parseFloat);
      const location = { name, latitude, longitude, language };
      
      webStore.set('location', location);
      return location;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  },
  
  // Electron-specific functions (no-op in web)
  minimize: () => {
    if (isElectron()) {
      window.api.minimize();
    }
    // No-op for web
  },
  
  maximize: () => {
    if (isElectron()) {
      window.api.maximize();
    }
    // No-op for web
  },
  
  isMaxmized: () => {
    if (isElectron()) {
      return window.api.isMaxmized();
    }
    return false;
  },
  
  close: () => {
    if (isElectron()) {
      window.api.close();
    } else {
      // For web, just close the tab/window
      window.close();
    }
  },
  
  sendNotification: (prayer) => {
    if (isElectron()) {
      window.api.sendNotification(prayer);
    } else {
      // Use browser notifications API for web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Prayer Time', {
          body: `It's time for ${prayer}`,
          icon: '/app.png'
        });
      }
    }
  },
  
  reloadPage: () => {
    window.location.reload();
  },
  
  receive: (channel, func) => {
    if (isElectron()) {
      window.api.receive(channel, func);
    }
    // No-op for web - these are Electron IPC channels
  },
  
  getElectronVersion: () => {
    if (isElectron()) {
      return window.api.getElectronVersion();
    }
    return null;
  },
  
  openURL: (url) => {
    if (isElectron()) {
      window.api.openURL(url);
    } else {
      window.open(url, '_blank');
    }
  },
  
  getAppVersion: () => {
    if (isElectron()) {
      return window.api.getAppVersion();
    }
    // For web, we can fetch from package.json or hardcode
    return '0.2.0';
  },
  
  getResourcePath: async (resourceName) => {
    if (isElectron()) {
      return window.api.getResourcePath(resourceName);
    }
    // For web, resources are in public folder
    return `${process.env.PUBLIC_URL}/${resourceName}`;
  },
  
  checkForUpdates: () => {
    if (isElectron()) {
      window.api.checkForUpdates();
    }
    // No-op for web
  },
  
  restartAndUpdate: () => {
    if (isElectron()) {
      window.api.restartAndUpdate();
    }
    // No-op for web
  },
  
  removeListener: (channel, func) => {
    if (isElectron()) {
      window.api.removeListener(channel, func);
    }
    // No-op for web
  }
});

// Export the compatible API
export const compatibleAPI = createWebAPI();
export { isElectron };