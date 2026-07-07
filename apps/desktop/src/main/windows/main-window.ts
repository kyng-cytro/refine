import { app, BrowserWindow } from "electron"
import { join } from "path"

let mainWindow: BrowserWindow | null = null
let quitting = false

export const setQuitting = (value: boolean): void => {
  quitting = value
}

export const getMainWindow = (): BrowserWindow | null => mainWindow

export const createMainWindow = (): BrowserWindow => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
    mainWindow.focus()
    return mainWindow
  }

  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    icon: app.isPackaged
      ? undefined
      : join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
    },
  })

  mainWindow.once("ready-to-show", () => mainWindow?.show())

  mainWindow.on("close", (e) => {
    if (!quitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }

  return mainWindow
}
