import { clipboard } from "electron"
import { EVENTS } from "../shared/ipc"
import type { HistoryItem } from "@refine/schemas"
import { apiError, getClient } from "./api-client"
import { detectCapability, simulateCopy, simulatePaste } from "./keysim"
import { state } from "./state"
import { showOverlay } from "./windows/overlay-window"
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

const pollClipboard = async (previous: string, tries: number): Promise<string> => {
  for (let i = 0; i < tries; i++) {
    await sleep(50)
    const text = clipboard.readText()
    if (text && text !== previous) return text
  }
  return ""
}

const captureSelection = async (): Promise<string> => {
  for (let attempt = 0; attempt < 3; attempt++) {
    clipboard.clear()
    await sleep(attempt === 0 ? 150 : 100)
    await simulateCopy()
    const text = await pollClipboard("", attempt === 0 ? 12 : 8)
    if (text) return text
  }
  return ""
}

export const runShortcutRefine = async (): Promise<void> => {
  const now = Date.now()
  if (inFlight || now - lastRun < 400) return
  inFlight = true

  const capability = detectCapability().capability
  const previousClipboard = clipboard.readText()

  try {
    const { connected, modelId, toneSlug } = state.snapshot()
    if (!connected || !modelId || !toneSlug) {
      showOverlay({ state: "error", message: "Not connected" }, 2500)
      return
    }

    let text: string
    if (capability === "full") {
      text = await captureSelection()
      if (!text) {
        if (previousClipboard) clipboard.writeText(previousClipboard)
        showOverlay({ state: "error", message: "No text selected" }, 2500)
        return
      }
    } else {
      text = previousClipboard
      if (!text) {
        showOverlay({ state: "error", message: "Clipboard is empty" }, 2500)
        return
      }
    }

    if (
      lastRefine &&
      lastRefine.source === text &&
      lastRefine.modelId === modelId &&
      lastRefine.toneSlug === toneSlug
    ) {
      clipboard.writeText(lastRefine.refined)
      if (state.autoApply && capability === "full") {
        await sleep(120)
        await simulatePaste()
      }
      showOverlay({ state: "success", message: "Refined" }, 1200)
      return
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
      if (capability === "full" && previousClipboard) {
        clipboard.writeText(previousClipboard)
      }
      showOverlay({ state: "error", message: apiError(e) }, 2500)
      return
    }

    clipboard.writeText(refined)
    lastRefine = { source: text, refined, modelId, toneSlug }

    if (state.autoApply && capability === "full") {
      await sleep(120)
      await simulatePaste()
    }

    showOverlay({ state: "success", message: "Refined" }, 1200)

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
