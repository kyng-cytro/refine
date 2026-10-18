import { useState } from "react"
import { updatePrompt } from "@refine/versions"
import { Button } from "@/components/m3/Button"
import { Dialog } from "@/components/m3/Dialog"
import { Spinner } from "@/components/m3/Spinner"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"
import { useVersionStore } from "@/store/version-store"

export function UpdateDialog() {
  const connected = useSettingsStore((s) => s.connected)
  const info = useVersionStore((s) => s.info)
  const [updating, setUpdating] = useState(false)

  const prompt = connected && info ? updatePrompt("desktop", info) : null
  if (!prompt) return null

  const update = async () => {
    setUpdating(true)
    try {
      await ipc.versions.update(prompt.target)
    } finally {
      setUpdating(false)
    }
  }

  const dismiss = () => ipc.versions.dismiss(prompt.target)
  const serverBlocked = prompt.blocking && prompt.target === "server"

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !prompt.blocking && dismiss()}
      title={prompt.title}
      description={prompt.description}
      actions={
        <>
          {prompt.blocking ? (
            <Button variant="text" onClick={() => ipc.session.disconnect()}>
              Disconnect
            </Button>
          ) : (
            <Button variant="text" onClick={dismiss}>
              Dismiss
            </Button>
          )}
          {!serverBlocked && (
            <Button onClick={update} disabled={updating}>
              {updating && <Spinner size={16} className="text-on-primary" />}
              Update
            </Button>
          )}
        </>
      }
    />
  )
}
