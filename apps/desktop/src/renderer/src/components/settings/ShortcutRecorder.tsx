import { useState } from "react"
import { Keyboard, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"

const MODIFIERS = new Set(["Control", "Alt", "Shift", "Meta"])

function toAccelerator(e: React.KeyboardEvent, isMac: boolean): string | null {
  if (MODIFIERS.has(e.key)) return null
  const parts: string[] = []
  if (e.metaKey) parts.push(isMac ? "Command" : "Super")
  if (e.ctrlKey) parts.push("Control")
  if (e.altKey) parts.push("Alt")
  if (e.shiftKey) parts.push("Shift")
  if (!parts.length) return null

  let key = e.key
  if (key === " ") key = "Space"
  else if (/^[a-z]$/.test(key)) key = key.toUpperCase()
  else if (key.length === 1) key = key.toUpperCase()
  parts.push(key)
  return parts.join("+")
}

function prettify(accelerator: string, platform: string): string {
  const isMac = platform === "darwin"
  const labels: Record<string, string> = {
    CommandOrControl: isMac ? "⌘" : "Ctrl",
    Command: "⌘",
    Control: isMac ? "⌃" : "Ctrl",
    Super: platform === "win32" ? "Win" : "Super",
    Alt: isMac ? "⌥" : "Alt",
    Shift: isMac ? "⇧" : "Shift",
  }
  return accelerator
    .split("+")
    .map((part) => labels[part] ?? part)
    .join("+")
}

type ShortcutKey = "shortcut" | "cycleToneShortcut" | "cycleModelShortcut"

export function ShortcutRecorder({
  settingKey,
  optional = false,
}: {
  settingKey: ShortcutKey
  optional?: boolean
}) {
  const shortcut = useSettingsStore((s) => s[settingKey])
  const update = useSettingsStore((s) => s.update)
  const platform = useSettingsStore((s) => s.capabilities?.platform ?? "")
  const [recording, setRecording] = useState(false)
  const [failed, setFailed] = useState(false)

  const clear = async () => {
    setFailed(false)
    await update({ [settingKey]: "" })
  }

  const startRecording = () => {
    setRecording(true)
    setFailed(false)
    ipc.system.setShortcutRecording(true)
  }

  const stopRecording = () => {
    setRecording(false)
    ipc.system.setShortcutRecording(false)
  }

  const onKeyDown = async (e: React.KeyboardEvent) => {
    e.preventDefault()
    const accelerator = toAccelerator(e, platform === "darwin")
    if (!accelerator) return
    setRecording(false)
    ipc.system.setShortcutRecording(false)
    const ok = await update({ [settingKey]: accelerator })
    setFailed(ok === false)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onKeyDown={onKeyDown}
          onFocus={startRecording}
          onBlur={stopRecording}
          className={cn(
            "flex h-12 w-full items-center gap-3 rounded-m3-xs border px-4 text-left transition-colors",
            recording
              ? "border-primary ring-1 ring-primary"
              : "border-outline hover:bg-on-surface/4",
          )}
        >
          <Keyboard className="h-5 w-5 text-on-surface-variant" />
          <span
            className={cn(
              "flex-1 text-body-large",
              shortcut || recording
                ? "text-on-surface"
                : "text-on-surface-variant",
            )}
          >
            {recording
              ? "Press keys…"
              : shortcut
                ? prettify(shortcut, platform)
                : "Not set"}
          </span>
        </button>
        {optional && shortcut && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear shortcut"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-m3-xs border border-outline text-on-surface-variant transition-colors hover:bg-on-surface/4"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {failed && (
        <p className="mt-1 text-body-small text-error">
          That shortcut couldn't be registered. It may be in use by another app
          or unavailable on this system.
        </p>
      )}
    </div>
  )
}
