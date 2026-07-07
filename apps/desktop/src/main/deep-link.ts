import { app } from "electron"
import { resolve } from "path"
import { EVENTS } from "../shared/ipc"
import type { PairIncoming } from "../shared/types"
import { createMainWindow } from "./windows/main-window"

let pending: PairIncoming | null = null

export const consumePendingPair = (): PairIncoming | null => {
  const value = pending
  pending = null
  return value
}

export const parsePairDeepLink = (raw: string): PairIncoming | null => {
  try {
    const url = new URL(raw)
    if (url.protocol !== "refine:" || url.hostname !== "pair") return null
    const token = url.searchParams.get("token")
    const serverUrl = url.searchParams.get("url")
    if (!token || !serverUrl) return null
    return {
      token,
      url: serverUrl,
      name: url.searchParams.get("name") || undefined,
    }
  } catch {
    return null
  }
}

export const handleDeepLink = (raw: string): void => {
  const parsed = parsePairDeepLink(raw)
  if (!parsed) return

  const win = createMainWindow()
  const send = () => win.webContents.send(EVENTS.pairIncoming, parsed)
  if (win.webContents.isLoading()) {
    pending = parsed
    win.webContents.once("did-finish-load", send)
  } else {
    send()
  }
}

export const findDeepLink = (argv: string[]): string | undefined =>
  argv.find((arg) => arg.startsWith("refine://"))

export const registerProtocolClient = (): void => {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("refine", process.execPath, [
        resolve(process.argv[1]!),
      ])
    }
  } else {
    app.setAsDefaultProtocolClient("refine")
  }
}
