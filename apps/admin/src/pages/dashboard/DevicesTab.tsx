import { useEffect, useState } from "react"
import { api, type Session, type Token } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, Copy, Smartphone, Trash2 } from "lucide-react"

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

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    setCreating(true)
    setError("")
    setNewToken(null)
    try {
      const t = await api.tokens.create(label.trim())
      setNewToken(t)
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
      {/* New pairing token */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate Pairing Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={createToken} className="flex gap-2">
            <div className="flex-1 space-y-1">
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
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>

          {newToken && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter this token in the Refine app. One-time use only.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono flex-1 break-all">
                  {newToken.token}
                </code>
                <Button variant="ghost" size="icon" onClick={copy}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      <Separator />

      {/* Connected devices */}
      <div>
        <h2 className="text-sm font-medium mb-3">Connected Devices</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No devices connected yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{s.deviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.pairingTokenLabel} ·{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => revoke(s.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
