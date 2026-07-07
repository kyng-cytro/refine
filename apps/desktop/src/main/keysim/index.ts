import { execFile, spawnSync } from "child_process"
import { promisify } from "util"
import type { KeySimCapability } from "../../shared/types"

const exec = promisify(execFile)

export type Capability = {
  capability: KeySimCapability
  reason?: string
}

let cached: Capability | null = null

const hasCommand = (command: string): boolean =>
  spawnSync("which", [command], { stdio: "ignore" }).status === 0

export const detectCapability = (): Capability => {
  if (cached) return cached

  if (process.platform === "linux") {
    if (process.env["XDG_SESSION_TYPE"] === "wayland") {
      cached = {
        capability: "manual",
        reason:
          "Wayland doesn't allow simulating keystrokes. Copy text yourself, press the shortcut, then paste the result.",
      }
    } else if (!hasCommand("xdotool")) {
      cached = {
        capability: "manual",
        reason:
          "xdotool is not installed. Install it for automatic copy/paste (e.g. sudo apt install xdotool).",
      }
    } else {
      cached = { capability: "full" }
    }
    return cached
  }

  cached = { capability: "full" }
  return cached
}

const modifier = process.platform === "darwin" ? "cmd" : "ctrl"

const simulate = async (key: "c" | "v"): Promise<void> => {
  if (detectCapability().capability !== "full") return

  if (process.platform === "linux") {
    await exec("xdotool", ["key", "--clearmodifiers", `${modifier}+${key}`])
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
