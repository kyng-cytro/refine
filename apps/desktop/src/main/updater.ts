import { app, shell } from "electron"
import { autoUpdater } from "electron-updater"
import { setQuitting } from "./windows/main-window"

const REPO = "https://github.com/kyng-cytro/refine"

export const SERVER_UPDATE_URL = `${REPO}/blob/main/GUIDE.md#updating`

const releaseTag = (version: string) =>
  encodeURIComponent(`@refine/desktop@${version}`)

const releasePage = (version: string | null) =>
  version ? `${REPO}/releases/tag/${releaseTag(version)}` : `${REPO}/releases`

// macOS needs a signed app to self-update, and .deb installs are managed by the system.
const canSelfUpdate = (): boolean =>
  app.isPackaged &&
  (process.platform === "win32" ||
    (process.platform === "linux" && Boolean(process.env["APPIMAGE"])))

const selfUpdate = async (version: string): Promise<boolean> => {
  autoUpdater.autoDownload = false
  autoUpdater.setFeedURL({
    provider: "generic",
    url: `${REPO}/releases/download/${releaseTag(version)}`,
  })
  const result = await autoUpdater.checkForUpdates()
  if (!result?.isUpdateAvailable) return false
  await autoUpdater.downloadUpdate()
  setQuitting(true)
  autoUpdater.quitAndInstall()
  return true
}

export const installAppUpdate = async (version: string | null): Promise<void> => {
  if (version && canSelfUpdate()) {
    const installed = await selfUpdate(version).catch(() => false)
    if (installed) return
  }
  await shell.openExternal(releasePage(version))
}
