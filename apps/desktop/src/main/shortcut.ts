import { globalShortcut } from "electron"

export type ShortcutId = "refine" | "cycleTone"

export const SHORTCUT_KEYS = {
  shortcut: "refine",
  cycleToneShortcut: "cycleTone",
} as const satisfies Record<string, ShortcutId>

const accelerators: Record<ShortcutId, string> = { refine: "", cycleTone: "" }
const handlers: Partial<Record<ShortcutId, () => void>> = {}
let paused = false

export const setTrigger = (id: ShortcutId, handler: () => void): void => {
  handlers[id] = handler
}

const registerAll = (): Record<ShortcutId, boolean> => {
  globalShortcut.unregisterAll()
  const ok: Record<ShortcutId, boolean> = { refine: true, cycleTone: true }
  if (paused) return ok
  for (const id of Object.keys(accelerators) as ShortcutId[]) {
    const accelerator = accelerators[id]
    if (!accelerator) continue
    try {
      globalShortcut.register(accelerator, () => handlers[id]?.())
      ok[id] = globalShortcut.isRegistered(accelerator)
    } catch {
      ok[id] = false
    }
  }
  return ok
}

export const registerShortcuts = (
  map: Partial<Record<ShortcutId, string>>,
): Record<ShortcutId, boolean> => {
  for (const id of Object.keys(map) as ShortcutId[]) {
    accelerators[id] = map[id] ?? ""
  }
  return registerAll()
}

export const setShortcut = (id: ShortcutId, accelerator: string): boolean => {
  accelerators[id] = accelerator
  return registerAll()[id]
}

export const setRecording = (recording: boolean): void => {
  paused = recording
  if (recording) globalShortcut.unregisterAll()
  else registerAll()
}

export const unregisterAll = (): void => globalShortcut.unregisterAll()
