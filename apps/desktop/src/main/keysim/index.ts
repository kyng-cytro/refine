import { execFile, spawnSync } from "child_process"
import { promisify } from "util"
import type { KeySimCapability } from "../../shared/types"

const exec = promisify(execFile)

type Capability = {
  capability: KeySimCapability
  reason?: string
}

let cached: Capability | null = null

const hasCommand = (command: string): boolean =>
  spawnSync("which", [command], { stdio: "ignore" }).status === 0

const detect = (): Capability => {
  if (process.platform !== "linux") return { capability: "full" }
  if (process.env["XDG_SESSION_TYPE"] === "wayland") {
    return {
      capability: "manual",
      reason:
        "Wayland doesn't allow simulating keystrokes. Copy text yourself, press the shortcut, then paste the result.",
    }
  }
  if (!hasCommand("xdotool")) {
    return {
      capability: "manual",
      reason:
        "xdotool is not installed. Install it for automatic copy/paste (e.g. sudo apt install xdotool).",
    }
  }
  return { capability: "full" }
}

export const detectCapability = (): Capability => (cached ??= detect())

const modifier = process.platform === "darwin" ? "cmd" : "ctrl"

const simulate = async (key: "c" | "v"): Promise<void> => {
  if (detectCapability().capability !== "full") return

  if (process.platform === "linux") {
    // Hold the modifier explicitly around the key; `key ctrl+v` races and can
    // deliver a bare "v" if the modifier hasn't registered yet.
    await exec("xdotool", [
      "keydown",
      "--clearmodifiers",
      modifier,
      "key",
      "--delay",
      "40",
      key,
      "keyup",
      modifier,
    ])
    return
  }

  if (process.platform === "darwin") {
    await exec("osascript", [
      "-e",
      `tell application "System Events" to keystroke "${key}" using command down`,
    ])
    return
  }

  if (process.platform === "win32") {
    await exec("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-WindowStyle",
      "Hidden",
      "-Command",
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^${key}')`,
    ])
  }
}

export const simulateCopy = () => simulate("c")
export const simulatePaste = () => simulate("v")
