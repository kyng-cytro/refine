import { useEffect, useState } from "react"
import { api, type Session, type SessionModelPref, type Token } from "@/lib/api"
import { MODELS } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronDown, Copy, Settings2, Smartphone, Trash2 } from "lucide-react"

interface DeviceRowProps {
  session: Session
  onRevoke: (id: string) => void
}

function DeviceRow({ session, onRevoke }: DeviceRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [loaded, setLoaded] = useState(false)

  const loadPrefs = async () => {
    if (loaded) return
    const rows = await api.sessions.listModels(session.id)
    const map: Record<string, boolean> = {}
    rows.forEach((r: SessionModelPref) => { map[r.modelId] = r.enabled })
    setPrefs(map)
    setLoaded(true)
  }

  const toggle = async (modelId: string, enabled: boolean) => {
    setPrefs((prev) => ({ ...prev, [modelId]: enabled }))
    try {
      await api.sessions.toggleModel(session.id, modelId, enabled)
    } catch {
      setPrefs((prev) => ({ ...prev, [modelId]: !enabled }))
    }
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{session.deviceName}</p>
            <p className="text-xs text-muted-foreground">
              via {session.pairingTokenLabel} · {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => { setExpanded((v) => !v); loadPrefs() }}
          >
            <Settings2 className="h-4 w-4" />
            <ChevronDown className={`h-3 w-3 ml-0.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRevoke(session.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 py-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Model overrides
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Override global model availability for this device only.
          </p>
          <div className="space-y-1">
            {MODELS.map((m) => {
              const active = prefs[m.id] ?? true
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => toggle(m.id, !active)}
                >
                  <div>
                    <span className="text-sm">{m.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{m.provider}</span>
                  </div>
                  <div className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-primary" : "bg-input"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DevicesTab() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState("")
  const [newToken, setNewToken] = useState<Token | null>(null)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    api.sessions
      .list()
      .then(setSessions)
      .catch(() => setError("Failed to load devices."))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    setCreating(true)
    setError("")
    setNewToken(null)
    try {
      setNewToken(await api.tokens.create(label.trim()))
      setLabel("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token.")
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (id: string) => {
    try {
      await api.sessions.remove(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError("Failed to revoke session.")
    }
  }

  const copy = () => {
    if (!newToken) return
    navigator.clipboard.writeText(newToken.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Pairing Token</CardTitle>
          <CardDescription>
            Generate a one-time token and enter it in the Refine app to link a device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={generate} className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="device-label">Device label</Label>
              <Input
                id="device-label"
                placeholder="My Phone"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={!label.trim() || creating}>
                {creating ? "Creating…" : "Generate"}
              </Button>
            </div>
          </form>

          {newToken && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                Enter this in the app under <strong>Settings → Connect to Server</strong>. One-time use only.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono flex-1 break-all">{newToken.token}</code>
                <Button variant="ghost" size="icon" onClick={copy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Connected Devices
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Smartphone className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No devices connected yet.</p>
          </div>
        ) : (
          sessions.map((s) => <DeviceRow key={s.id} session={s} onRevoke={revoke} />)
        )}
      </div>
    </div>
  )
}
