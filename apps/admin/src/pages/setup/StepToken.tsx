import { useState } from "react"
import { api, type Token } from "@/lib/api"
import { DEVICE_TYPES, type DeviceType } from "@/lib/device-type"
import { DeviceTypeSelector } from "@/components/device-type-selector"
import { PairingTokenDisplay } from "@/components/pairing-token-display"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onNext: () => void
}

export default function StepToken({ onNext }: Props) {
  const [label, setLabel] = useState("My Phone")
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile")
  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const changeType = (type: DeviceType) => {
    setDeviceType(type)
    const previous = DEVICE_TYPES.find((t) => t.value === deviceType)
    if (!label.trim() || label === previous?.placeholder) {
      setLabel(DEVICE_TYPES.find((t) => t.value === type)?.placeholder ?? "")
    }
  }

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    setLoading(true)
    setError("")
    try {
      setToken(await api.tokens.create(label.trim(), deviceType))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Link Your Device</h1>
        <p className="text-muted-foreground mt-1.5">
          Generate a one-time pairing token and scan the QR code in the Refine app.
        </p>
      </div>

      <div className="space-y-4">
        {!token ? (
          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Device Type</Label>
              <DeviceTypeSelector value={deviceType} onChange={changeType} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label">Device Label</Label>
              <Input
                id="label"
                placeholder={
                  DEVICE_TYPES.find((t) => t.value === deviceType)?.placeholder
                }
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={!label.trim() || loading}>
              {loading ? "Generating…" : "Generate Token"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <PairingTokenDisplay token={token} />
            <Button className="w-full" onClick={onNext}>
              Continue
            </Button>
          </div>
        )}

        {!token && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onNext}>
            Skip for now
          </Button>
        )}
      </div>
    </div>
  )
}
