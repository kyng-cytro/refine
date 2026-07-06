/** Renderer -> main (ipcRenderer.invoke / ipcMain.handle) */
export const IPC = {
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
} as const

/** Main -> renderer (webContents.send / ipcRenderer.on) */
export const EVENTS = {
  stateChanged: "state:changed",
  overlayState: "overlay:state",
  historyPrepend: "history:prepend",
  pairIncoming: "pair:incoming",
} as const
