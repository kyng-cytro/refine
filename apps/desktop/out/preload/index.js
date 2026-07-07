"use strict";
const electron = require("electron");
const IPC = {
  settingsGet: "settings:get",
  settingsUpdate: "settings:update",
  sessionPair: "session:pair",
  sessionDisconnect: "session:disconnect",
  sessionBootstrap: "session:bootstrap",
  refineRun: "refine:run",
  tonesList: "tones:list",
  tonesCreate: "tones:create",
  tonesUpdate: "tones:update",
  tonesDelete: "tones:delete",
  providersList: "providers:list",
  historyList: "history:list",
  historyDelete: "history:delete",
  systemCapabilities: "system:capabilities",
  shortcutSetRecording: "shortcut:set-recording",
  pairConsume: "pair:consume"
};
const EVENTS = {
  stateChanged: "state:changed",
  overlayState: "overlay:state",
  historyPrepend: "history:prepend",
  pairIncoming: "pair:incoming"
};
const subscribe = (channel, callback) => {
  const listener = (_e, payload) => callback(payload);
  electron.ipcRenderer.on(channel, listener);
  return () => {
    electron.ipcRenderer.removeListener(channel, listener);
  };
};
const api = {
  settings: {
    get: () => electron.ipcRenderer.invoke(IPC.settingsGet),
    update: (patch) => electron.ipcRenderer.invoke(IPC.settingsUpdate, patch)
  },
  session: {
    pair: (input) => electron.ipcRenderer.invoke(IPC.sessionPair, input),
    disconnect: () => electron.ipcRenderer.invoke(IPC.sessionDisconnect),
    bootstrap: () => electron.ipcRenderer.invoke(IPC.sessionBootstrap),
    consumePendingPair: () => electron.ipcRenderer.invoke(IPC.pairConsume)
  },
  refine: (body) => electron.ipcRenderer.invoke(IPC.refineRun, body),
  tones: {
    list: () => electron.ipcRenderer.invoke(IPC.tonesList),
    create: (body) => electron.ipcRenderer.invoke(IPC.tonesCreate, body),
    update: (id, body) => electron.ipcRenderer.invoke(IPC.tonesUpdate, id, body),
    delete: (id) => electron.ipcRenderer.invoke(IPC.tonesDelete, id)
  },
  providers: {
    list: () => electron.ipcRenderer.invoke(IPC.providersList)
  },
  history: {
    list: (limit) => electron.ipcRenderer.invoke(IPC.historyList, limit),
    delete: (id) => electron.ipcRenderer.invoke(IPC.historyDelete, id)
  },
  system: {
    capabilities: () => electron.ipcRenderer.invoke(IPC.systemCapabilities),
    setShortcutRecording: (recording) => electron.ipcRenderer.invoke(IPC.shortcutSetRecording, recording)
  },
  onStateChanged: (cb) => subscribe(EVENTS.stateChanged, cb),
  onOverlayState: (cb) => subscribe(EVENTS.overlayState, cb),
  onHistoryPrepend: (cb) => subscribe(EVENTS.historyPrepend, cb),
  onPairIncoming: (cb) => subscribe(EVENTS.pairIncoming, cb)
};
electron.contextBridge.exposeInMainWorld("refineDesktop", api);
