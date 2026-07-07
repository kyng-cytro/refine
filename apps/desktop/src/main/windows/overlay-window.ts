import { BrowserWindow, screen } from "electron"
import { join } from "path"
import { EVENTS } from "../../shared/ipc"
import type { OverlayCorner, OverlayState } from "../../shared/types"
import { state } from "../state"

const WIDTH = 220
const HEIGHT = 52
const INSET = 16

let overlay: BrowserWindow | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const load = (win: BrowserWindow) => {
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/overlay`)
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: "/overlay",
    })
  }
}

const ensureOverlay = (): BrowserWindow => {
  if (overlay && !overlay.isDestroyed()) return overlay
  overlay = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: { preload: join(__dirname, "../preload/index.js") },
  })
  overlay.setAlwaysOnTop(true, "screen-saver")
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  overlay.setIgnoreMouseEvents(true)
  load(overlay)
  return overlay
}

const positionFor = (corner: OverlayCorner) => {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const { x, y, width, height } = display.workArea
  const left = corner.endsWith("left") ? x + INSET : x + width - WIDTH - INSET
  const top = corner.startsWith("top") ? y + INSET : y + height - HEIGHT - INSET
  return { x: Math.round(left), y: Math.round(top) }
}

export const showOverlay = (
  payload: OverlayState,
  autoHideMs?: number,
): void => {
  const win = ensureOverlay()
  const { x, y } = positionFor(state.overlayCorner)
  win.setBounds({ x, y, width: WIDTH, height: HEIGHT })

  const send = () => win.webContents.send(EVENTS.overlayState, payload)
  if (win.webContents.isLoading()) win.webContents.once("did-finish-load", send)
  else send()

  win.showInactive()

  if (hideTimer) clearTimeout(hideTimer)
  if (autoHideMs) hideTimer = setTimeout(() => hideOverlay(), autoHideMs)
}

export const hideOverlay = (): void => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (overlay && !overlay.isDestroyed()) overlay.hide()
}

export const createOverlayWindow = (): void => {
  ensureOverlay()
}
