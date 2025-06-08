const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  Notification,
  Tray,
  Menu,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const Store = require("electron-store");
const { Coordinates, PrayerTimes, CalculationMethod } = require("adhan");
const i18next = require("i18next");
const moment = require("moment");
const cron = require("node-cron");
const { autoUpdater } = require("electron-updater");

Store.initRenderer();
const store = new Store();

const settings = store.get("settings") || {};

i18next.init({
  lng: settings.language || "ar",
  supportedLngs: ["ar", "en"],
  fallbackLng: "ar",
  resources: {
    en: { translation: require("./en.json") },
    ar: { translation: require("./ar.json") },
  },
});

let mainWindow;
let tray = null;

function getIcon(filename,extension) {
  const ext = extension || (process.platform === "linux" ? "png" : "ico");
  const devPath = path.join(__dirname, "../public", `${filename}.${ext}`);
  const prodPath = path.join(__dirname, "../build", `${filename}.${ext}`);
  return isDev ? devPath : prodPath;
}

function createTray() {
  tray = new Tray(getIcon("icon","png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18next.t("open_app", "Open App"),
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: i18next.t("check_for_updates", "Check for Updates"),
      click: () => {
        if (!isDev) {
          autoUpdater.checkForUpdatesAndNotify();
        }
      },
    },
    { type: "separator" },
    {
      label: i18next.t("exit", "Exit"),
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Noor");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 920,
    height: 800,
    minHeight: 800,
    minWidth: 920,
    autoHideMenuBar: true,
    frame: false,
    icon: getIcon("app"),
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  const mainURL = isDev
    ? "http://localhost:3000/?page=home"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(mainURL);

  // Create system tray
  createTray();

  // Handle close button
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      const userSettings = store.get("settings") || {};
      if (userSettings.minimize_to_tray) {
        event.preventDefault();
        mainWindow.hide();
        return false;
      }
    }
    return true;
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Initialize auto-updater after window creation
  if (!isDev) {
    initAutoUpdater();
  }
}

// Configure and initialize auto-updater
function initAutoUpdater() {
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "haith2m",
    repo: "noor-app",
  });

  // Don't check for updates automatically on startup
  // Only check when user explicitly requests it

  // Auto updater events
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info);
    mainWindow?.webContents.send("update-available");
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("Update not available:", info);
    mainWindow?.webContents.send("update-check-result", {
      type: "no-update",
      message: i18next.t("app_up_to_date", "You are running the latest version")
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("Update not available:", info);
    mainWindow.webContents.send("update-check-result", {
      type: "no-update",
      message: i18next.t("app_up_to_date", "You are running the latest version")
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info);
    // Notify the user that update is ready
    const notification = new Notification({
      title: i18next.t("update_ready_title", "Update Ready"),
      body: i18next.t(
        "update_ready_message",
        "A new version has been downloaded. Restart the application to apply the updates."
      ),
      icon: getIcon("app"),
    });
    notification.show();

    mainWindow?.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    console.error("Error in auto-updater:", err);
    
    mainWindow?.webContents.send("update-check-result", {
      type: "error",
      error: err,
      message: i18next.t("update_error_message", "Failed to check for updates")
    });
  });
}

function getResourcePath(resourceName) {
  if (isDev) {
    return `http://localhost:3000/${resourceName}`;
  } else {
    return path.join(app.getAppPath(), "build", resourceName);
  }
}

// Reset daily notifications
function resetDailyNotifications() {
  const currentDate = new Date().toLocaleDateString();
  if (store.get("lastNotificationDate") !== currentDate) {
    store.set("lastNotificationDate", currentDate);
    store.set("sentNotifications", {});
  }
}

function sendPrayerNotification(prayer) {
  try {
    const sentNotifications = { ...(store.get("sentNotifications") || {}) };

    // Check if notification was already sent for this prayer
    if (sentNotifications[prayer]) {
      return;
    }

    // send notification
    const notification = new Notification({
      title: i18next.t("notification_title"),
      body: i18next.t("notification_body", { prayer: i18next.t(prayer) }),
      icon: getIcon("app"),
      urgency: "critical",
      timeoutType: "never",
      silent: true,
    });

    notification.show();

    // Play adhan
    if (mainWindow) {
      const adhanPath = getResourcePath("adhan.wav");
      mainWindow.webContents.send("play-adhan", {
        path: adhanPath,
        appPath: adhanPath,
      });
      console.log("Sending adhan path:", adhanPath);
    }

    sentNotifications[prayer] = true;
    store.set("sentNotifications", sentNotifications);
  } catch (error) {
    console.error("Error sending prayer notification:", error);
  }
}

// Prayer times check cron job - runs every minute
cron.schedule("* * * * *", async () => {
  try {
    resetDailyNotifications();

    const location = store.get("location");
    const settings = store.get("settings") || {};

    if (!settings.adhan_notifications) {
      return;
    }

    if (!location || !location.latitude || !location.longitude) {
      console.log("No location configured");
      return;
    }

    const coordinates = new Coordinates(location.latitude, location.longitude);
    const method = settings.calculationMethod || "UmmAlQura";
    const params = CalculationMethod[method]();

    // Calculate prayer times with error handling
    let prayerTimes;
    try {
      prayerTimes = new PrayerTimes(coordinates, new Date(), params);
    } catch (error) {
      console.error("Error calculating prayer times:", error);
      return;
    }

    const currentPrayer = prayerTimes.currentPrayer();
    const nextPrayer = prayerTimes.nextPrayer();

    // Get the prayer time we want to check
    const prayerToCheck = currentPrayer === "none" ? nextPrayer : currentPrayer;

    // Only send notifications for the 5 prayers
    const mainPrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

    if (prayerToCheck && mainPrayers.includes(prayerToCheck)) {
      const prayerTime = moment(prayerTimes.timeForPrayer(prayerToCheck));
      const now = moment();

      if (Math.abs(prayerTime.diff(now, "minutes")) <= 1) {
        mainWindow.webContents.send("reload-prayers");
        sendPrayerNotification(prayerToCheck);
      }
    }
  } catch (error) {
    console.error("Error in prayer check cron job:", error);
  }
});

// Electron app event handlers
app.on("ready", () => {
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createMainWindow();
});

// Set app.isQuitting flag when quitting
app.on("before-quit", () => {
  app.isQuitting = true;
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

// IPC event handlers for window control
ipcMain.on("minimize", () => mainWindow.minimize());
ipcMain.on("maximize", () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on("isMaxmized", () => {
  mainWindow.isMaximized()
    ? mainWindow.webContents.send("isMaxmized", true)
    : mainWindow.webContents.send("isMaxmized", false);
});
ipcMain.on("close", () => mainWindow.close());
ipcMain.on("open-url", (event, url) => {
  shell.openExternal(url);
});
ipcMain.handle("get-resource-path", (event, resourceName) => {
  return getResourcePath(resourceName);
});

// Add IPC handlers for updates
ipcMain.on("restart-app", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on("check-for-updates", () => {
  if (isDev) {
    // In development mode, show a message that updates are not available
    mainWindow.webContents.send("update-check-result", {
      type: "dev-mode",
      message: i18next.t("updates_disabled_dev", "Update checking is disabled in development mode")
    });
    console.log("Update checking is disabled in development mode");
    return;
  }
  
  try {
    // Notify that we're checking for updates
    mainWindow.webContents.send("update-check-result", {
      type: "checking",
      message: i18next.t("checking_for_updates", "Checking for updates...")
    });
    
    autoUpdater.checkForUpdatesAndNotify();
    console.log("Checking for updates...");
  } catch (error) {
    console.error("Error checking for updates:", error);
    mainWindow.webContents.send("update-check-result", {
      type: "error",
      error: error,
      message: i18next.t("update_error_message", "Failed to check for updates")
    });
  }
});