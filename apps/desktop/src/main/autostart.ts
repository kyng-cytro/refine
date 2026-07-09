import { app } from "electron"
import { mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"

const autostartDir = () =>
  join(
    process.env["XDG_CONFIG_HOME"] || join(app.getPath("home"), ".config"),
    "autostart",
  )

const autostartFile = () => join(autostartDir(), "refine.desktop")

const linuxExec = () => process.env["APPIMAGE"] || app.getPath("exe")

const setLinuxAutostart = (enabled: boolean): void => {
  const file = autostartFile()
  if (!enabled) {
    rmSync(file, { force: true })
    return
  }
  const entry = [
    "[Desktop Entry]",
    "Type=Application",
    `Name=${app.getName()}`,
    `Exec=${linuxExec()}`,
    "Icon=refine",
    "Terminal=false",
    "X-GNOME-Autostart-enabled=true",
    "",
  ].join("\n")
  mkdirSync(autostartDir(), { recursive: true })
  writeFileSync(file, entry)
}

export const setLaunchAtLogin = (enabled: boolean): void => {
  if (process.platform === "linux") {
    setLinuxAutostart(enabled)
    return
  }
  app.setLoginItemSettings({ openAtLogin: enabled })
}
