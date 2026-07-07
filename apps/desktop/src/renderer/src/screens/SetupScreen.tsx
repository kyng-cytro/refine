import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/m3/Button"
import { Spinner } from "@/components/m3/Spinner"
import { TextField } from "@/components/m3/TextField"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"

/** Parse a pasted pairing link (https .../pair?... or refine://pair?...). */
function parsePairLink(raw: string) {
  try {
    const url = new URL(raw.trim())
    const token = url.searchParams.get("token")
    if (!token) return null
    const serverUrl =
      url.protocol === "refine:"
        ? decodeURIComponent(url.searchParams.get("url") ?? "")
        : url.origin
    if (!serverUrl) return null
    return {
      serverUrl,
      pairingToken: token,
      deviceName: url.searchParams.get("name") ?? "",
    }
  } catch {
    return null
  }
}

export default function SetupScreen() {
  const navigate = useNavigate()
  const capabilities = useSettingsStore((s) => s.capabilities)
  const [serverUrl, setServerUrl] = useState("")
  const [pairingToken, setPairingToken] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!deviceName && capabilities?.hostname) {
      setDeviceName(capabilities.hostname)
    }
  }, [capabilities, deviceName])

  /** A pasted pairing link in either field fills the whole form. */
  const handlePaste = (value: string, fallback: (v: string) => void) => {
    const parsed = parsePairLink(value)
    if (parsed) {
      setServerUrl(parsed.serverUrl)
      setPairingToken(parsed.pairingToken)
      if (parsed.deviceName) setDeviceName(parsed.deviceName)
    } else {
      fallback(value)
    }
  }

  const connect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await ipc.session.pair({
        serverUrl,
        pairingToken,
        deviceName,
      })
      if (!res.ok) {
        setError(res.error ?? "Connection failed")
        return
      }
      navigate("/", { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-headline-small">Connect to Refine</h1>
        <p className="mt-2 text-body-medium text-on-surface-variant">
          Open the pairing link from your admin dashboard, or enter the server
          URL and pairing token manually. Pasting a pairing link into any field
          fills the form.
        </p>

        <form onSubmit={connect} className="mt-6 space-y-4">
          <TextField
            label="Server URL"
            placeholder="https://refine.example.com"
            value={serverUrl}
            onChange={(e) => handlePaste(e.target.value, setServerUrl)}
            autoCorrect="off"
            spellCheck={false}
          />
          <TextField
            label="Pairing token"
            placeholder="Paste token or pairing link"
            value={pairingToken}
            onChange={(e) => handlePaste(e.target.value, setPairingToken)}
            autoCorrect="off"
            spellCheck={false}
          />
          <TextField
            label="Device name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            error={error || undefined}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !serverUrl.trim() || !pairingToken.trim()}
          >
            {loading && <Spinner size={16} className="text-on-primary" />}
            Connect
          </Button>
        </form>
      </div>
    </div>
  )
}
