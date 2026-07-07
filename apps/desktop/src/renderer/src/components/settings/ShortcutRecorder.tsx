import { useState } from "react"
import { Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"

const MODIFIERS = new Set(["Control", "Alt", "Shift", "Meta"])

function toAccelerator(e: React.KeyboardEvent): string | null {
  if (MODIFIERS.has(e.key)) return null
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push("CommandOrControl")
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

function prettify(accelerator: string): string {
  return accelerator.replace("CommandOrControl", "Ctrl/⌘")
}

export function ShortcutRecorder() {
  const shortcut = useSettingsStore((s) => s.shortcut)
  const update = useSettingsStore((s) => s.update)
  const [recording, setRecording] = useState(false)
  const [failed, setFailed] = useState(false)

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
    const accelerator = toAccelerator(e)
    if (!accelerator) return
    setRecording(false)
    ipc.system.setShortcutRecording(false)
    const ok = await update({ shortcut: accelerator })
    setFailed(ok === false)
  }

  return (
    <div>
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
        <span className="flex-1 text-body-large text-on-surface">
          {recording ? "Press keys…" : prettify(shortcut)}
        </span>
      </button>
      {failed && (
        <p className="mt-1 text-body-small text-error">
          That shortcut couldn't be registered. It may be in use by another app
          or unavailable on this system.
        </p>
      )}
    </div>
  )
}
