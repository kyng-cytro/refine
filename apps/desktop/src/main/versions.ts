import { app, BrowserWindow } from "electron"
import {
  dismissalKey,
  resolveVersions,
  type ServerVersions,
  type UpdateTarget,
  type VersionInfo,
} from "@refine/versions"
import { EVENTS } from "../shared/ipc"
import { state } from "./state"

let server: ServerVersions | null = null

export const getVersionInfo = (): VersionInfo =>
  resolveVersions("desktop", app.getVersion(), server, state.dismissedUpdates)

const broadcast = (): void => {
  const info = getVersionInfo()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(EVENTS.versionsChanged, info)
  }
}

export const setServerVersions = (next: ServerVersions | null): void => {
  server = next
  broadcast()
}

export const knownServerVersion = (): string | null => server?.version ?? null

export const dismissUpdate = (target: UpdateTarget): void => {
  const key = dismissalKey(getVersionInfo(), target)
  if (!key) return
  state.dismissUpdate(key)
  broadcast()
}
