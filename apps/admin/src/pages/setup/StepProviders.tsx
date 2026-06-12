import { useState } from "react"
import { api } from "@/lib/api"
import { MODELS, PROVIDERS, type ModelProvider } from "@/lib/models"
import { ProviderAccordion, type ProviderEntry } from "@/components/provider-accordion"
import { Button } from "@/components/ui/button"

interface Props {
  onNext: () => void
}

export default function StepProviders({ onNext }: Props) {
  const [keys, setKeys] = useState<Record<ModelProvider, string>>({ openai: "", anthropic: "", google: "" })
  const [showKey, setShowKey] = useState<Record<ModelProvider, boolean>>({ openai: false, anthropic: false, google: false })
  const [models, setModels] = useState<Record<string, boolean>>(
    Object.fromEntries(MODELS.map((m) => [m.id, true])),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const hasKey = (p: ModelProvider) => !!keys[p].trim()

  const entries: ProviderEntry[] = PROVIDERS.map((p) => ({
    provider: p,
    apiKey: keys[p],
    showKey: showKey[p],
    onKeyChange: (v) => setKeys((prev) => ({ ...prev, [p]: v })),
    onToggleShow: () => setShowKey((prev) => ({ ...prev, [p]: !prev[p] })),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const configured = PROVIDERS.filter((p) => hasKey(p))
    if (configured.length === 0) {
      setError("Add at least one API key to continue.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await Promise.all(configured.map((p) => api.providers.upsert(p, keys[p].trim(), true)))
      await Promise.all(
        MODELS.map((m) => api.providers.toggleModel(m.provider, m.id, hasKey(m.provider) && models[m.id])),
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
