import { clipboard } from "electron"
import type { HistoryItem } from "@refine/schemas"
import { isBlocked } from "@refine/versions"
import { EVENTS } from "../shared/ipc"
import { apiError, getClient } from "./api-client"
import { detectCapability, simulateCopy, simulatePaste } from "./keysim"
import { state } from "./state"
import { getVersionInfo } from "./versions"
import { prewarmOverlay, showOverlay } from "./windows/overlay-window"
import { getMainWindow } from "./windows/main-window"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let inFlight = false
let lastRun = 0
let lastRefine: {
  source: string
  refined: string
  modelId: string
  toneSlug: string
} | null = null

const pollClipboard = async (tries: number): Promise<string> => {
  for (let i = 0; i < tries; i++) {
    await sleep(50)
    const text = clipboard.readText()
    if (text) return text
  }
  return ""
}

const captureSelection = async (): Promise<string> => {
  for (let attempt = 0; attempt < 3; attempt++) {
    clipboard.clear()
    await sleep(attempt === 0 ? 150 : 100)
    await simulateCopy()
    const text = await pollClipboard(attempt === 0 ? 12 : 8)
    if (text) return text
  }
  return ""
}

const showError = (message: string) =>
  showOverlay({ state: "error", message }, 2500)

const deliver = async (refined: string, canPaste: boolean) => {
  clipboard.writeText(refined)
  if (state.autoApply && canPaste) {
    await sleep(120)
    await simulatePaste()
  }
  showOverlay({ state: "success", message: "Refined" }, 1200)
}

export const runShortcutRefine = async (): Promise<void> => {
  const now = Date.now()
  if (inFlight || now - lastRun < 400) return
  inFlight = true
  prewarmOverlay()

  const canSimulate = detectCapability().capability === "full"
  const previousClipboard = clipboard.readText()
  const restoreClipboard = () => {
    if (canSimulate && previousClipboard) clipboard.writeText(previousClipboard)
  }

  try {
    const { connected, modelId, toneSlug } = state.snapshot()
    if (!connected || !modelId || !toneSlug) return showError("Not connected")
    if (isBlocked(getVersionInfo())) return showError("Update required")

    const text = canSimulate ? await captureSelection() : previousClipboard
    if (!text) {
      restoreClipboard()
      return showError(canSimulate ? "No text selected" : "Clipboard is empty")
    }

    if (
      lastRefine &&
      lastRefine.source === text &&
      lastRefine.modelId === modelId &&
      lastRefine.toneSlug === toneSlug
    ) {
      return deliver(lastRefine.refined, canSimulate)
    }

    showOverlay({ state: "refining", message: "Refining…" })

    let refined: string
    try {
      const client = getClient()
      if (!client) throw new Error("Not connected")
      const res = await client.refine({
        text,
        modelId,
        toneSlug,
        save: state.saveHistory,
        private: state.privateHistory,
      })
      refined = res.refined
    } catch (e) {
      restoreClipboard()
      return showError(apiError(e))
    }

    lastRefine = { source: text, refined, modelId, toneSlug }
    await deliver(refined, canSimulate)

    if (state.saveHistory) {
      const entry: HistoryItem = {
        id: `shortcut-${now}`,
        source: text,
        refined,
        modelId,
        toneSlug,
        createdAt: now,
      }
      getMainWindow()?.webContents.send(EVENTS.historyPrepend, entry)
    }
  } finally {
    inFlight = false
    lastRun = Date.now()
  }
}
