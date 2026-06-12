import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { MODELS, PROVIDER_LABELS, PROVIDERS, type ModelProvider } from "@/lib/models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Save } from "lucide-react"

interface ProviderState {
  apiKey: string
  enabled: boolean
  saving: boolean
  showKey: boolean
}

interface ModelPrefState {
  [modelId: string]: boolean
}

export default function ProvidersTab() {
  const [providers, setProviders] = useState<Record<ModelProvider, ProviderState>>(
    Object.fromEntries(
      PROVIDERS.map((p) => [p, { apiKey: "", enabled: true, saving: false, showKey: false }]),
    ) as Record<ModelProvider, ProviderState>,
  )
  const [modelPrefs, setModelPrefs] = useState<ModelPrefState>(
    Object.fromEntries(MODELS.map((m) => [m.id, true])),
  )
  const [error, setError] = useState("")

  useEffect(() => {
    api.modelPrefs.list().then((res) => {
      const prefs: ModelPrefState = {}
      res.providers.forEach((p) => {
        p.models.forEach((m) => {
          prefs[m.id] = m.enabledByUser
        })
      })
      setModelPrefs((prev) => ({ ...prev, ...prefs }))
    }).catch(() => {})
  }, [])

  const saveProvider = async (provider: ModelProvider) => {
    const { apiKey, enabled } = providers[provider]
    if (!apiKey.trim()) return
    setProviders((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], saving: true },
    }))
    setError("")
    try {
      await api.providers.upsert(provider, apiKey.trim(), enabled)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setProviders((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], saving: false },
      }))
    }
  }

  const toggleModel = async (provider: ModelProvider, modelId: string, value: boolean) => {
    setModelPrefs((prev) => ({ ...prev, [modelId]: value }))
    try {
      await api.providers.toggleModel(provider, modelId, value)
    } catch {
      setModelPrefs((prev) => ({ ...prev, [modelId]: !value }))
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-destructive text-sm">{error}</p>}
      {PROVIDERS.map((p) => (
        <Card key={p}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{PROVIDER_LABELS[p]}</CardTitle>
            <Badge variant={providers[p].enabled ? "default" : "secondary"}>
              {providers[p].enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={providers[p].showKey ? "text" : "password"}
                    placeholder="Enter new API key to update"
                    value={providers[p].apiKey}
                    onChange={(e) =>
                      setProviders((prev) => ({
                        ...prev,
                        [p]: { ...prev[p], apiKey: e.target.value },
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() =>
                      setProviders((prev) => ({
                        ...prev,
                        [p]: { ...prev[p], showKey: !prev[p].showKey },
                      }))
                    }
                  >
                    {providers[p].showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!providers[p].apiKey.trim() || providers[p].saving}
                  onClick={() => saveProvider(p)}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Models</p>
              <div className="grid grid-cols-2 gap-2">
                {MODELS.filter((m) => m.provider === p).map((m) => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-primary h-4 w-4"
                      checked={modelPrefs[m.id] ?? true}
                      onChange={(e) => toggleModel(p, m.id, e.target.checked)}
                    />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
