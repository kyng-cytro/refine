import { useState } from "react"
import { api } from "@/lib/api"
import { PROVIDERS, getModels, type ModelProvider } from "@/lib/models"
import { ProviderAccordion, type ProviderEntry } from "@/components/provider-accordion"
import { Button } from "@/components/ui/button"

interface Props {
  onNext: () => void
}

export default function StepProviders({ onNext }: Props) {
  const [keys, setKeys] = useState<Record<string, string>>(
    Object.fromEntries(PROVIDERS.map((p) => [p.id, ""])),
  )
  const [showKey, setShowKey] = useState<Record<string, boolean>>(
    Object.fromEntries(PROVIDERS.map((p) => [p.id, false])),
  )
  const [models, setModels] = useState<Record<string, boolean>>(
    Object.fromEntries(getModels().map((m) => [m.id, true])),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const hasKey = (p: ModelProvider) => !!keys[p]?.trim()

  const entries: ProviderEntry[] = PROVIDERS.map((p) => ({
    provider: p.id,
    apiKey: keys[p.id],
    showKey: showKey[p.id],
    onKeyChange: (v) => setKeys((prev) => ({ ...prev, [p.id]: v })),
    onToggleShow: () => setShowKey((prev) => ({ ...prev, [p.id]: !prev[p.id] })),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const configured = PROVIDERS.filter((p) => hasKey(p.id))
    if (configured.length === 0) {
      setError("Add at least one API key to continue.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await Promise.all(configured.map((p) => api.providers.upsert(p.id, keys[p.id].trim(), true)))
      await Promise.all(
        getModels().map((m) => api.providers.toggleModel(m.provider, m.id, hasKey(m.provider as ModelProvider) && models[m.id])),
      )
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configure Providers</h1>
        <p className="text-muted-foreground mt-1.5">
          Add API keys for the providers you want to use and enable their models.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProviderAccordion
          entries={entries}
          models={models}
          onToggleModel={(_, modelId, enabled) => setModels((prev) => ({ ...prev, [modelId]: enabled }))}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </Button>
      </form>
    </div>
  )
}
