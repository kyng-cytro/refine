import { useEffect, useState } from "react"
import { Button } from "@/components/m3/Button"
import { Dialog } from "@/components/m3/Dialog"
import { Spinner } from "@/components/m3/Spinner"
import { TextField } from "@/components/m3/TextField"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"
import type { PairIncoming } from "../../../shared/types"

interface Props {
  params: PairIncoming | null
  onDismiss: () => void
  onPaired: () => void
}

export function PairConfirmDialog({ params, onDismiss, onPaired }: Props) {
  const existingUrl = useSettingsStore((s) => s.serverUrl)
  const [deviceName, setDeviceName] = useState(params?.name ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params) {
      setDeviceName(params.name ?? "")
      setError("")
    }
  }, [params])

  const connect = async () => {
    if (!params) return
    setError("")
    setLoading(true)
    try {
      const res = await ipc.session.pair({
        serverUrl: params.url,
        pairingToken: params.token,
        deviceName,
      })
      if (!res.ok) {
        setError(res.error ?? "Connection failed")
        return
      }
      onDismiss()
      onPaired()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={!!params}
      onOpenChange={(open) => !open && !loading && onDismiss()}
      title="Connect to server"
      description={params?.url}
      actions={
        <>
          <Button variant="text" onClick={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={connect} disabled={loading}>
            {loading && <Spinner size={16} className="text-on-primary" />}
            Connect
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {existingUrl && existingUrl !== params?.url && (
          <div className="rounded-m3-sm bg-error-container px-3 py-2 text-body-small text-on-error-container">
            This will replace your current connection to {existingUrl}
          </div>
        )}
        <TextField
          label="Device name"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          error={error || undefined}
          autoCorrect="off"
        />
      </div>
    </Dialog>
  )
}
