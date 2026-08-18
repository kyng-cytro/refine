import { BrowserWindow, powerMonitor, screen } from "electron"
import { join } from "path"
import { EVENTS } from "../../shared/ipc"
import type { OverlayCorner, OverlayState } from "../../shared/types"
import { log } from "../log"
import { state } from "../state"

const WIDTH = 280
const ERROR_WIDTH = 420
const HEIGHT = 52
const INSET = 16
const DESTROY_AFTER_IDLE_MS = 15_000
const READY_TIMEOUT_MS = 1_500

let overlay: BrowserWindow | null = null
let building: Promise<BrowserWindow> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let destroyTimer: ReturnType<typeof setTimeout> | null = null
let showId = 0

const clearTimers = () => {
  if (hideTimer) clearTimeout(hideTimer)
  if (destroyTimer) clearTimeout(destroyTimer)
  hideTimer = null
  destroyTimer = null
}

const routeFor = (payload: OverlayState) => {
  const params = new URLSearchParams({ state: payload.state })
  if (payload.message) params.set("message", payload.message)
  return `/overlay?${params.toString()}`
}

const load = (win: BrowserWindow, payload: OverlayState) => {
  const hash = routeFor(payload)
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#${hash}`)
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), { hash })
  }
}

const whenReadyToShow = (win: BrowserWindow): Promise<BrowserWindow> =>
  new Promise((resolve) => {
    const timeout = setTimeout(() => {
      log("overlay", "ready-to-show timed out")
      resolve(win)
    }, READY_TIMEOUT_MS)
    win.once("ready-to-show", () => {
      clearTimeout(timeout)
      resolve(win)
    })
  })

const isUsable = (win: BrowserWindow | null): win is BrowserWindow =>
  !!win && !win.isDestroyed() && !win.webContents.isCrashed()

const build = (payload: OverlayState): Promise<BrowserWindow> => {
  const win = new BrowserWindow({
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
  overlay = win
  win.setAlwaysOnTop(true, "screen-saver")
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.setIgnoreMouseEvents(true)
  win.webContents.on("render-process-gone", (_e, details) => {
    log("overlay", `render process gone: ${details.reason}`)
    destroyOverlay()
  })
  load(win, payload)
  return whenReadyToShow(win)
}

const ensure = (payload: OverlayState): Promise<BrowserWindow> => {
  if (isUsable(overlay)) return building ?? Promise.resolve(overlay)
  if (overlay) destroyOverlay()
  building = build(payload).finally(() => {
    building = null
  })
  return building
}

const positionFor = (corner: OverlayCorner, winWidth: number) => {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const { x, y, width, height } = display.workArea
  const left = corner.endsWith("left")
    ? x + INSET
    : x + width - winWidth - INSET
  const top = corner.startsWith("top") ? y + INSET : y + height - HEIGHT - INSET
  return { x: Math.round(left), y: Math.round(top) }
}

const show = async (payload: OverlayState, autoHideMs?: number) => {
  const id = ++showId
  clearTimers()

  const win = await ensure(payload)
  if (id !== showId || win !== overlay || win.isDestroyed()) return

  const width = payload.state === "error" ? ERROR_WIDTH : WIDTH
  const { x, y } = positionFor(state.overlayCorner, width)
  win.setBounds({ x, y, width, height: HEIGHT })
  win.webContents.send(EVENTS.overlayState, payload)
  win.setAlwaysOnTop(true, "screen-saver")
  win.showInactive()

  log("overlay", `shown ${payload.state} at ${x},${y}`)
  if (!win.isVisible()) log("overlay", "shown but not visible")

  if (autoHideMs) hideTimer = setTimeout(() => hideOverlay(), autoHideMs)
}

export const showOverlay = (
  payload: OverlayState,
  autoHideMs?: number,
): void => {
  void show(payload, autoHideMs)
}

export const prewarmOverlay = (): void => {
  void ensure({ state: "refining" })
  if (!destroyTimer) {
    destroyTimer = setTimeout(() => destroyOverlay(), DESTROY_AFTER_IDLE_MS)
  }
}

export const hideOverlay = (): void => {
  clearTimers()
  if (!overlay || overlay.isDestroyed()) return
  overlay.hide()
  destroyTimer = setTimeout(() => destroyOverlay(), DESTROY_AFTER_IDLE_MS)
}

export const destroyOverlay = (): void => {
  clearTimers()
  showId++
  building = null
  const win = overlay
  overlay = null
  if (win && !win.isDestroyed()) win.destroy()
}

export const initOverlay = (): void => {
  const destroyOn = (event: string) => () => {
    if (!overlay) return
    log("overlay", `tearing down on ${event}`)
    destroyOverlay()
  }
  powerMonitor.on("suspend", destroyOn("suspend"))
  powerMonitor.on("resume", destroyOn("resume"))
  powerMonitor.on("unlock-screen", destroyOn("unlock-screen"))
}
