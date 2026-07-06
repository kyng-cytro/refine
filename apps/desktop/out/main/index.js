"use strict";
const electron = require("electron");
const os = require("os");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const IPC = {
  settingsGet: "settings:get",
  settingsUpdate: "settings:update",
  systemCapabilities: "system:capabilities"
};
const EVENTS = {
  stateChanged: "state:changed"
};
let cached = null;
const hasCommand = (command) => child_process.spawnSync("which", [command], { stdio: "ignore" }).status === 0;
const detectCapability = () => {
  if (cached) return cached;
  if (process.platform === "linux") {
    if (process.env["XDG_SESSION_TYPE"] === "wayland") {
      cached = {
        capability: "manual",
        reason: "Wayland doesn't allow simulating keystrokes. Copy text yourself, press the shortcut, then paste the result."
      };
    } else if (!hasCommand("xdotool")) {
      cached = {
        capability: "manual",
        reason: "xdotool is not installed. Install it for automatic copy/paste (e.g. sudo apt install xdotool)."
      };
    } else {
      cached = { capability: "full" };
    }
    return cached;
  }
  cached = { capability: "full" };
  return cached;
};
class JsonStore {
  path;
  data;
  constructor(filename, defaults) {
    this.path = path.join(electron.app.getPath("userData"), filename);
    let loaded = {};
    try {
      loaded = JSON.parse(fs.readFileSync(this.path, "utf8"));
    } catch {
    }
    this.data = { ...defaults, ...loaded };
  }
  get(key) {
    return this.data[key];
  }
  set(patch) {
    this.data = { ...this.data, ...patch };
    this.flush();
  }
  flush() {
    const tmp = `${this.path}.tmp`;
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.path);
  }
}
const DEFAULTS = {
  serverUrl: "",
  deviceName: "",
  toneSlug: "",
  modelId: "",
  shortcut: "CommandOrControl+Shift+R",
  autoApply: false,
  overlayCorner: "bottom-left",
  launchAtLogin: false,
  encryptedSessionToken: "",
  plainSessionToken: ""
};
class AppState {
  store = new JsonStore("settings.json", DEFAULTS);
  listeners = /* @__PURE__ */ new Set();
  /** In-memory, refetched from the server on bootstrap. */
  tones = [];
  models = [];
  get sessionToken() {
    const encrypted = this.store.get("encryptedSessionToken");
    if (encrypted) {
      try {
        return electron.safeStorage.decryptString(Buffer.from(encrypted, "base64"));
      } catch {
        return "";
      }
    }
    return this.store.get("plainSessionToken");
  }
  get connected() {
    return Boolean(this.store.get("serverUrl") && this.sessionToken);
  }
  get serverUrl() {
    return this.store.get("serverUrl");
  }
  get toneSlug() {
    return this.store.get("toneSlug");
  }
  get modelId() {
    return this.store.get("modelId");
  }
  get shortcut() {
    return this.store.get("shortcut");
  }
  get autoApply() {
    return this.store.get("autoApply");
  }
  get overlayCorner() {
    return this.store.get("overlayCorner");
  }
  snapshot() {
    return {
      connected: this.connected,
      serverUrl: this.store.get("serverUrl"),
      deviceName: this.store.get("deviceName"),
      toneSlug: this.store.get("toneSlug"),
      modelId: this.store.get("modelId"),
      shortcut: this.store.get("shortcut"),
      autoApply: this.store.get("autoApply"),
      overlayCorner: this.store.get("overlayCorner"),
      launchAtLogin: this.store.get("launchAtLogin"),
      tones: this.tones,
      models: this.models
    };
  }
  update(patch) {
    this.store.set(patch);
    this.emit();
  }
  setServerConfig(serverUrl, sessionToken, deviceName) {
    const secure = electron.safeStorage.isEncryptionAvailable();
    this.store.set({
      serverUrl,
      deviceName,
      encryptedSessionToken: secure ? electron.safeStorage.encryptString(sessionToken).toString("base64") : "",
      plainSessionToken: secure ? "" : sessionToken
    });
    this.emit();
  }
  clearServerConfig() {
    this.tones = [];
    this.models = [];
    this.store.set({
      serverUrl: "",
      deviceName: "",
      toneSlug: "",
      modelId: "",
      encryptedSessionToken: "",
      plainSessionToken: ""
    });
    this.emit();
  }
  setCatalog(tones, models) {
    this.tones = tones;
    this.models = models;
    const patch = {};
    if (!tones.some((t) => t.slug === this.toneSlug)) {
      patch.toneSlug = tones[0]?.slug ?? "";
    }
    if (!models.some((m) => m.id === this.modelId)) {
      patch.modelId = models[0]?.id ?? "";
    }
    if (Object.keys(patch).length) this.store.set(patch);
    this.emit();
  }
  setTones(tones) {
    this.setCatalog(tones, this.models);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit() {
    for (const listener of this.listeners) listener();
  }
}
const state = new AppState();
const broadcastState = () => {
  const snapshot = state.snapshot();
  for (const win of electron.BrowserWindow.getAllWindows()) {
    win.webContents.send(EVENTS.stateChanged, snapshot);
  }
};
const registerIpc = () => {
  state.subscribe(broadcastState);
  electron.ipcMain.handle(IPC.settingsGet, () => state.snapshot());
  electron.ipcMain.handle(
    IPC.settingsUpdate,
    (_e, patch) => {
      state.update(patch);
      return { snapshot: state.snapshot() };
    }
  );
  electron.ipcMain.handle(IPC.systemCapabilities, () => {
    const { capability, reason } = detectCapability();
    return {
      platform: process.platform,
      keySim: capability,
      keySimReason: reason,
      safeStorage: electron.safeStorage.isEncryptionAvailable(),
      hostname: os.hostname()
    };
  });
};
let mainWindow = null;
const createMainWindow = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }
  mainWindow = new electron.BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
};
electron.app.whenReady().then(() => {
  registerIpc();
  createMainWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
