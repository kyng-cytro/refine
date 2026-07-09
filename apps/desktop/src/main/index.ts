import { app, BrowserWindow } from "electron"
import {
  findDeepLink,
  handleDeepLink,
  registerProtocolClient,
} from "./deep-link"
import { setLaunchAtLogin } from "./autostart"
import { cycleTone } from "./cycle-tone"
import { registerIpc } from "./ipc"
import { runShortcutRefine } from "./refine-flow"
import { registerShortcuts, setTrigger, unregisterAll } from "./shortcut"
import { state } from "./state"
import { createTray } from "./tray"
import {
  createMainWindow,
  getMainWindow,
  setQuitting,
} from "./windows/main-window"
import { createOverlayWindow } from "./windows/overlay-window"

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
    createOverlayWindow()
    createTray()

    setTrigger("refine", runShortcutRefine)
    setTrigger("cycleTone", cycleTone)
    registerShortcuts({
      refine: state.shortcut,
      cycleTone: state.cycleToneShortcut,
    })

    if (app.isPackaged && state.launchAtLogin) setLaunchAtLogin(true)

    const link = findDeepLink(process.argv)
    if (link) handleDeepLink(link)

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

  app.on("before-quit", () => setQuitting(true))
  app.on("will-quit", () => unregisterAll())
}
