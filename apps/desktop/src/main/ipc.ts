import { BrowserWindow, ipcMain, safeStorage } from "electron"
import { hostname } from "os"
import { EVENTS, IPC } from "../shared/ipc"
import type {
  SystemCapabilities,
  UpdatableSettings,
  UpdateResult,
} from "../shared/types"
import { detectCapability } from "./keysim"
import { state } from "./state"

export const broadcastState = (): void => {
  const snapshot = state.snapshot()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(EVENTS.stateChanged, snapshot)
  }
}

export const registerIpc = (): void => {
  state.subscribe(broadcastState)

  ipcMain.handle(IPC.settingsGet, () => state.snapshot())

  ipcMain.handle(
    IPC.settingsUpdate,
    (_e, patch: UpdatableSettings): UpdateResult => {
      state.update(patch)
      return { snapshot: state.snapshot() }
    },
  )

  ipcMain.handle(IPC.systemCapabilities, (): SystemCapabilities => {
    const { capability, reason } = detectCapability()
    return {
      platform: process.platform,
      keySim: capability,
      keySimReason: reason,
      safeStorage: safeStorage.isEncryptionAvailable(),
      hostname: hostname(),
    }
  })
}
