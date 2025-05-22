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

const systemLang = app.getLocale().split("-")[0];
const settings = store.get("settings") || {};

i18next.init({
  lng: settings.language || systemLang || "ar",
  supportedLngs: ["ar", "en"],
  fallbackLng: "ar",
  resources: {
    en: { translation: require("./en.json") },
    ar: { translation: require("./ar.json") },
  },
});

let mainWindow;
let tray = null;

function getIcon(filename) {
  const ext = process.platform === "linux" ? "png" : "ico";
  const devPath = path.join(__dirname, "../public", `${filename}.${ext}`);
  const prodPath = path.join(__dirname, "../build", `${filename}.${ext}`);
  return isDev ? devPath : prodPath;
}

function createTray() {
  tray = new Tray(getIcon("app"));

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
        if (!isDev) autoUpdater.checkForUpdatesAndNotify();
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
      devTools: false,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  const mainURL = isDev
    ? "http://localhost:3000/?page=home"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(mainURL);
  createTray();

  mainWindow.on("close", (event) => {
    if (!app.isQuitting && (store.get("settings")?.minimize_to_tray ?? true)) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (!isDev) initAutoUpdater();
}

function initAutoUpdater() {
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "haith2m",
    repo: "noor-app",
  });

  autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 60 * 60 * 1000);

  autoUpdater.on("checking-for-update", () =>
    console.log("Checking for updates..."),
  );

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info);
    mainWindow?.webContents.send("update-available");
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info);
    new Notification({
      title: i18next.t("update_ready_title", "Update Ready"),
      body: i18next.t(
        "update_ready_message",
        "A new version has been downloaded. Restart the application to apply the updates.",
      ),
      icon: getIcon("app"),
    }).show();

    mainWindow?.webContents.send("update-downloaded");
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto-updater error:", err);
  });
}

function getResourcePath(name) {
  return isDev
    ? `http://localhost:3000/${name}`
    : path.join(app.getAppPath(), "build", name);
}

function resetDailyNotifications() {
  const currentDate = new Date().toLocaleDateString();
  if (store.get("lastNotificationDate") !== currentDate) {
    store.set("lastNotificationDate", currentDate);
    store.set("sentNotifications", {});
  }
}

function sendPrayerNotification(prayer) {
  const sent = { ...(store.get("sentNotifications") || {}) };
  if (sent[prayer]) return;

  new Notification({
    title: i18next.t("notification_title"),
    body: i18next.t("notification_body", { prayer: i18next.t(prayer) }),
    icon: getIcon("app"),
    urgency: "critical",
    timeoutType: "never",
    silent: true,
  }).show();

  if (mainWindow) {
    const adhanPath = getResourcePath("adhan.wav");
    mainWindow.webContents.send("play-adhan", {
      path: adhanPath,
      appPath: adhanPath,
    });
  }

  sent[prayer] = true;
  store.set("sentNotifications", sent);
}

cron.schedule("* * * * *", async () => {
  try {
    resetDailyNotifications();

    const location = store.get("location");
    const settings = store.get("settings") || {};

    if (!settings.adhan_notifications || !location?.latitude) return;

    const coords = new Coordinates(location.latitude, location.longitude);
    const method = settings.calculationMethod || "UmmAlQura";
    const params = CalculationMethod[method]();

    let prayerTimes;
    try {
      prayerTimes = new PrayerTimes(coords, new Date(), params);
    } catch (e) {
      console.error("Prayer time calc error:", e);
      return;
    }

    const now = moment();
    const currentPrayer = prayerTimes.currentPrayer();
    const nextPrayer = prayerTimes.nextPrayer();
    const prayer = currentPrayer === "none" ? nextPrayer : currentPrayer;

    const mainPrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    if (prayer && mainPrayers.includes(prayer)) {
      const prayerTime = moment(prayerTimes.timeForPrayer(prayer));
      if (Math.abs(prayerTime.diff(now, "minutes")) <= 1) {
        mainWindow?.webContents.send("reload-prayers");
        sendPrayerNotification(prayer);
      }
    }
  } catch (e) {
    console.error("Prayer cron error:", e);
  }
});

// App events
app.on("ready", createMainWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (!mainWindow) createMainWindow();
});
app.on("before-quit", () => {
  app.isQuitting = true;
  tray?.destroy();
  tray = null;
});

// IPC
ipcMain.on("minimize", () => mainWindow?.minimize());
ipcMain.on("maximize", () =>
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(),
);
ipcMain.on("isMaxmized", () =>
  mainWindow?.webContents.send("isMaxmized", mainWindow.isMaximized()),
);
ipcMain.on("close", () => mainWindow?.close());
ipcMain.on("open-url", (e, url) => shell.openExternal(url));
ipcMain.handle("get-resource-path", (e, name) => getResourcePath(name));
ipcMain.on("restart-app", () => autoUpdater.quitAndInstall());
ipcMain.on("check-for-updates", () => {
  if (!isDev) autoUpdater.checkForUpdatesAndNotify();
});
