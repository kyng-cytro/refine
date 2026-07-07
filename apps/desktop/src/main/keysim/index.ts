import { spawnSync } from "child_process"
import type { KeySimCapability } from "../../shared/types"

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
