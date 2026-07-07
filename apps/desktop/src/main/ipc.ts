import { app, BrowserWindow, ipcMain, safeStorage } from "electron"
import { hostname } from "os"
import type { CreateTone, RefineRequest, UpdateTone } from "@refine/schemas"
import { EVENTS, IPC } from "../shared/ipc"
import type {
  PairInput,
  SystemCapabilities,
  UpdatableSettings,
  UpdateResult,
} from "../shared/types"
import { apiError, bootstrapCatalog, getClient, pairAndBootstrap } from "./api-client"
import { consumePendingPair } from "./deep-link"
import { detectCapability } from "./keysim"
import { registerShortcut, setRecording } from "./shortcut"
import { state } from "./state"

export const broadcastState = (): void => {
  const snapshot = state.snapshot()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(EVENTS.stateChanged, snapshot)
  }
}

const requireClient = () => {
  const client = getClient()
  if (!client) throw new Error("Not connected")
  return client
}

const refreshTones = async () => {
  try {
    state.setTones(await requireClient().tones.list())
  } catch {}
}

export const registerIpc = (): void => {
  state.subscribe(broadcastState)

  ipcMain.handle(IPC.settingsGet, () => state.snapshot())

  ipcMain.handle(
    IPC.settingsUpdate,
    (_e, patch: UpdatableSettings): UpdateResult => {
      const shortcutChanged =
        patch.shortcut !== undefined && patch.shortcut !== state.shortcut
      state.update(patch)
      let shortcutOk: boolean | undefined
      if (shortcutChanged) shortcutOk = registerShortcut(state.shortcut)
      if (patch.launchAtLogin !== undefined && process.platform !== "linux") {
        app.setLoginItemSettings({ openAtLogin: patch.launchAtLogin })
      }
      return { snapshot: state.snapshot(), shortcutOk }
    },
  )

  ipcMain.handle(IPC.shortcutSetRecording, (_e, recording: boolean) => {
    setRecording(recording)
  })

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

  ipcMain.handle(IPC.sessionPair, (_e, input: PairInput) =>
    pairAndBootstrap(input),
  )

  ipcMain.handle(IPC.pairConsume, () => consumePendingPair())

  ipcMain.handle(IPC.sessionDisconnect, () => {
    state.clearServerConfig()
  })

  ipcMain.handle(IPC.sessionBootstrap, async () => {
    try {
      await bootstrapCatalog()
    } catch (e) {
      throw new Error(apiError(e))
    }
  })

  ipcMain.handle(IPC.refineRun, async (_e, body: RefineRequest) => {
    try {
      return await requireClient().refine(body)
    } catch (e) {
      throw new Error(apiError(e))
    }
  })

  ipcMain.handle(IPC.tonesList, () => requireClient().tones.list())

  ipcMain.handle(IPC.tonesCreate, async (_e, body: CreateTone) => {
    const tone = await requireClient().tones.create(body)
    await refreshTones()
    return tone
  })

  ipcMain.handle(
    IPC.tonesUpdate,
    async (_e, id: string, body: UpdateTone) => {
      const tone = await requireClient().tones.update(id, body)
      await refreshTones()
      return tone
    },
  )

  ipcMain.handle(IPC.tonesDelete, async (_e, id: string) => {
    await requireClient().tones.delete(id)
    await refreshTones()
  })

  ipcMain.handle(IPC.providersList, () => requireClient().providers.list())

  ipcMain.handle(IPC.historyList, async (_e, limit?: number) => {
    const res = await requireClient().history.list({ limit: limit ?? 50 })
    return res.data
  })

  ipcMain.handle(IPC.historyDelete, (_e, id: string) =>
    requireClient().history.delete(id),
  )
}
