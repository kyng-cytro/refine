import { app, BrowserWindow } from "electron"
import {
  findDeepLink,
  handleDeepLink,
  registerProtocolClient,
} from "./deep-link"
import { registerIpc } from "./ipc"
import { createTray } from "./tray"
import {
  createMainWindow,
  getMainWindow,
  setQuitting,
} from "./windows/main-window"

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  registerProtocolClient()

  app.on("second-instance", (_e, argv) => {
    const win = getMainWindow() ?? createMainWindow()
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
    const link = findDeepLink(argv)
    if (link) handleDeepLink(link)
  })

  app.on("open-url", (e, url) => {
    e.preventDefault()
    handleDeepLink(url)
  })

  app.whenReady().then(() => {
    registerIpc()
    createMainWindow()
    createTray()

    const link = findDeepLink(process.argv)
    if (link) handleDeepLink(link)

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

  app.on("before-quit", () => setQuitting(true))
}
