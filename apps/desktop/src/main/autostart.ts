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
    `Exec="${linuxExec()}" --hidden`,
    "Icon=refine",
    "Terminal=false",
    "X-GNOME-Autostart-enabled=true",
    "",
  ].join("\n")
  mkdirSync(autostartDir(), { recursive: true })
  writeFileSync(file, entry)
}

const launchAgentDir = () => join(app.getPath("home"), "Library", "LaunchAgents")

const launchAgentFile = () => join(launchAgentDir(), "io.refine.desktop.plist")

const setMacAutostart = (enabled: boolean): void => {
  app.setLoginItemSettings({ openAtLogin: false })
  const file = launchAgentFile()
  if (!enabled) {
    rmSync(file, { force: true })
    return
  }
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>io.refine.desktop</string>
  <key>ProgramArguments</key>
  <array>
    <string>${app.getPath("exe")}</string>
    <string>--hidden</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
`
  mkdirSync(launchAgentDir(), { recursive: true })
  writeFileSync(file, plist)
}

export const setLaunchAtLogin = (enabled: boolean): void => {
  if (process.platform === "linux") {
    setLinuxAutostart(enabled)
    return
  }
  if (process.platform === "darwin") {
    setMacAutostart(enabled)
    return
  }
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: enabled,
    args: ["--hidden"],
  })
}
