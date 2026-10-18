import { app } from "electron"
import {
  findDeepLink,
  handleDeepLink,
  registerProtocolClient,
} from "./deep-link"
import { setLaunchAtLogin } from "./autostart"
import { cycleModel, cycleTone } from "./cycle"
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
import { initOverlay } from "./windows/overlay-window"

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
    const startHidden = process.argv.includes("--hidden")

    registerIpc()
    createMainWindow({ hidden: startHidden })
    initOverlay()
    createTray()

    setTrigger("refine", runShortcutRefine)
    setTrigger("cycleTone", cycleTone)
    setTrigger("cycleModel", cycleModel)
    registerShortcuts({
      refine: state.shortcut,
      cycleTone: state.cycleToneShortcut,
      cycleModel: state.cycleModelShortcut,
    })

    if (app.isPackaged && state.launchAtLogin) setLaunchAtLogin(true)

    const link = findDeepLink(process.argv)
    if (link) handleDeepLink(link)

    app.on("activate", () => createMainWindow())
  })

  app.on("before-quit", () => setQuitting(true))
  app.on("will-quit", () => unregisterAll())
}
