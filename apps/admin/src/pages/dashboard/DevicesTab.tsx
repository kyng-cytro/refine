import { useEffect, useState } from "react"
import {
  api,
  type Session,
  type SessionProviderState,
  type Token,
} from "@/lib/api"
import { deviceTypeIcon, DEVICE_TYPES, type DeviceType } from "@/lib/device-type"
import { type ModelProvider } from "@/lib/models"
import { DeviceTypeSelector } from "@/components/device-type-selector"
import { ProviderAccordion } from "@/components/provider-accordion"
import { CopyButton } from "@/components/copy-button"
import { PairingTokenDisplay } from "@/components/pairing-token-display"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, Clock, Settings2, Smartphone, Trash2 } from "lucide-react"

function formatExpiry(expiresAt: number | null): string {
  if (!expiresAt) return "Never"
  const d = new Date(expiresAt)
  if (d < new Date()) return "Expired"
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface DeviceRowProps {
  session: Session
  onRevoke: (id: string) => void
  onExpiryChange: (id: string, expiresAt: number | null) => void
}

function DeviceRow({ session, onRevoke, onExpiryChange }: DeviceRowProps) {
  const DeviceIcon = deviceTypeIcon(session.deviceType)
  const [expanded, setExpanded] = useState(false)
  const [tree, setTree] = useState<SessionProviderState[]>([])
  const [loaded, setLoaded] = useState(false)
  const [expiryInput, setExpiryInput] = useState(
    session.expiresAt
      ? new Date(session.expiresAt).toISOString().slice(0, 16)
      : "",
  )
  const [savingExpiry, setSavingExpiry] = useState(false)

  const isExpired = session.expiresAt !== null && session.expiresAt < Date.now()

  const refetch = async () => setTree(await api.sessions.listModels(session.id))

  const loadPrefs = async () => {
    if (loaded) return
    await refetch()
    setLoaded(true)
  }

  const patchModels = (ids: string[], enabled: boolean) =>
    setTree((prev) =>
      prev.map((p) => ({
        ...p,
        models: p.models.map((m) =>
          ids.includes(m.id)
            ? {
                ...m,
                sessionOverride: enabled,
                effectiveEnabled: p.usable && enabled,
              }
            : m,
        ),
      })),
    )

  const toggle = async (modelId: string, enabled: boolean) => {
    patchModels([modelId], enabled)
    try {
      await api.sessions.toggleModel(session.id, modelId, enabled)
    } catch {
      await refetch()
    }
  }

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    const provider = tree.find((p) => p.provider === providerId)
    if (!provider || !provider.usable) return
    const ids = provider.models.map((m) => m.id)
    patchModels(ids, enabled)
    try {
      await Promise.all(
        ids.map((id) => api.sessions.toggleModel(session.id, id, enabled)),
      )
    } catch {
      await refetch()
    }
  }

  const saveExpiry = async () => {
    setSavingExpiry(true)
    try {
      const ts = expiryInput ? new Date(expiryInput).getTime() : null
      const updated = await api.sessions.expiry(session.id, ts)
      onExpiryChange(session.id, updated.expiresAt)
    } finally {
      setSavingExpiry(false)
    }
  }

  return (
    <div
      className={`rounded-lg border overflow-hidden ${isExpired ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <DeviceIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{session.deviceName}</p>
            <p className="text-xs text-muted-foreground">
              via {session.pairingTokenLabel} ·{" "}
              {new Date(session.createdAt).toLocaleDateString()}
              {session.expiresAt !== null && (
                <span className={isExpired ? " text-destructive" : ""}>
                  {" "}
                  · expires {formatExpiry(session.expiresAt)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setExpanded((v) => !v)
              loadPrefs()
            }}
          >
            <Settings2 className="h-4 w-4" />
            <ChevronDown
              className={`h-3 w-3 ml-0.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
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
        <div className="border-t px-4 py-3 bg-muted/30 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Session expiry
            </p>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                type="datetime-local"
                value={expiryInput}
                onChange={(e) => setExpiryInput(e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={saveExpiry}
                disabled={savingExpiry}
              >
                {savingExpiry ? "Saving…" : "Set"}
              </Button>
              {expiryInput && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    setExpiryInput("")
                    onExpiryChange(session.id, null)
                    api.sessions.expiry(session.id, null)
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Provider &amp; model overrides
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Override global provider and model availability for this device
              only. Providers without an API key or disabled globally can't be
              enabled here.
            </p>
            {!loaded ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <ProviderAccordion
                variant="devices"
                entries={tree.map((p) => ({
                  provider: p.provider as ModelProvider,
                  enabled:
                    p.usable && p.models.every((m) => m.effectiveEnabled),
                  hasKey: p.usable,
                  onToggleEnabled: (enabled) =>
                    toggleProvider(p.provider, enabled),
                }))}
                models={Object.fromEntries(
                  tree.flatMap((p) =>
                    p.models.map((m) => [m.id, m.effectiveEnabled]),
                  ),
                )}
                onToggleModel={(_provider, modelId, enabled) =>
                  toggle(modelId, enabled)
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DevicesTab() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [serverUrl, setServerUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState("")
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile")
  const [newToken, setNewToken] = useState<Token | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    Promise.all([api.sessions.list(), api.setup.status()])
      .then(([s, setup]) => {
        setSessions(s)
        setServerUrl(setup.url)
      })
      .catch(() => setError("Failed to load."))
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
      setNewToken(await api.tokens.create(label.trim(), deviceType))
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

  const updateExpiry = (id: string, expiresAt: number | null) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expiresAt } : s)),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Pairing Token</CardTitle>
          <CardDescription>
            Generate a token and share the QR code or link with the user to pair
            their device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serverUrl && (
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="text-xs text-muted-foreground shrink-0">
                Server URL
              </span>
              <code className="text-xs font-mono flex-1 truncate">
                {serverUrl}
              </code>
              <CopyButton text={serverUrl} />
            </div>
          )}

          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Device type</Label>
              <DeviceTypeSelector value={deviceType} onChange={setDeviceType} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="device-label">Device label</Label>
                <Input
                  id="device-label"
                  placeholder={
                    DEVICE_TYPES.find((t) => t.value === deviceType)
                      ?.placeholder
                  }
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={!label.trim() || creating}>
                  {creating ? "Creating…" : "Generate"}
                </Button>
              </div>
            </div>
          </form>

          {newToken && <PairingTokenDisplay token={newToken} />}
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
            <p className="text-sm text-muted-foreground">
              No devices connected yet.
            </p>
          </div>
        ) : (
          sessions.map((s) => (
            <DeviceRow
              key={s.id}
              session={s}
              onRevoke={revoke}
              onExpiryChange={updateExpiry}
            />
          ))
        )}
      </div>
    </div>
  )
}
