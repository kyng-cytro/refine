import { globalShortcut } from "electron"

let currentAccelerator: string | null = null
let onTrigger: (() => void) | null = null
let paused = false

export const setTrigger = (handler: () => void): void => {
  onTrigger = handler
}

export const registerShortcut = (accelerator: string): boolean => {
  globalShortcut.unregisterAll()
  currentAccelerator = accelerator
  if (paused || !accelerator) return true
  try {
    globalShortcut.register(accelerator, () => onTrigger?.())
    return globalShortcut.isRegistered(accelerator)
  } catch {
    return false
  }
}

export const setRecording = (recording: boolean): void => {
  paused = recording
  if (recording) {
    globalShortcut.unregisterAll()
  } else if (currentAccelerator) {
    registerShortcut(currentAccelerator)
  }
}

export const unregisterAll = (): void => globalShortcut.unregisterAll()
