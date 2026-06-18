import { useEffect, useState } from "react"
import { api, type ProviderState } from "@/lib/api"
import { PROVIDERS, getModels, type ModelProvider } from "@/lib/models"
import { ProviderAccordion, type ProviderEntry } from "@/components/provider-accordion"

interface FormState {
  apiKey: string
  showKey: boolean
  saving: boolean
  saved: boolean
  enabled: boolean
  hasKey: boolean
}

const defaultForms = () =>
  Object.fromEntries(
    PROVIDERS.map((p) => [p.id, { apiKey: "", showKey: false, saving: false, saved: false, enabled: false, hasKey: false }]),
  ) as Record<ModelProvider, FormState>

export default function ProvidersTab() {
  const [forms, setForms] = useState<Record<ModelProvider, FormState>>(defaultForms)
  const [models, setModels] = useState<Record<string, boolean>>(
    Object.fromEntries(getModels().map((m) => [m.id, false])),
  )
  const [error, setError] = useState("")

  useEffect(() => {
    api.providers.list().then((providerStates: ProviderState[]) => {
      const modelMap: Record<string, boolean> = {}
      const stateMap: Partial<Record<ModelProvider, { enabled: boolean; hasKey: boolean }>> = {}
      providerStates.forEach((p) => {
        stateMap[p.provider as ModelProvider] = { enabled: p.enabled, hasKey: p.hasKey }
        p.models.forEach((m) => { modelMap[m.id] = m.enabled })
      })
      setForms((prev) =>
        Object.fromEntries(
          PROVIDERS.map((p) => [p.id, { ...prev[p.id], enabled: stateMap[p.id]?.enabled ?? false, hasKey: stateMap[p.id]?.hasKey ?? false }]),
        ) as Record<ModelProvider, FormState>,
      )
      setModels((prev) => ({ ...prev, ...modelMap }))
    }).catch(() => {})
  }, [])

  const save = async (p: ModelProvider) => {
    const key = forms[p].apiKey.trim()
    if (!key) return
    setForms((prev) => ({ ...prev, [p]: { ...prev[p], saving: true, saved: false } }))
    setError("")
    try {
      await api.providers.upsert(p, key, forms[p].enabled)
      setForms((prev) => ({ ...prev, [p]: { ...prev[p], saving: false, saved: true, hasKey: true, apiKey: "" } }))
      setTimeout(() => setForms((prev) => ({ ...prev, [p]: { ...prev[p], saved: false } })), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      setForms((prev) => ({ ...prev, [p]: { ...prev[p], saving: false } }))
    }
  }

  const toggleProvider = async (p: ModelProvider, enabled: boolean) => {
    setForms((prev) => ({ ...prev, [p]: { ...prev[p], enabled } }))
    try {
      await api.providers.upsert(p, undefined, enabled)
    } catch {
      setForms((prev) => ({ ...prev, [p]: { ...prev[p], enabled: !enabled } }))
    }
  }

  const toggleModel = async (provider: ModelProvider, modelId: string, enabled: boolean) => {
    setModels((prev) => ({ ...prev, [modelId]: enabled }))
    try {
      await api.providers.toggleModel(provider, modelId, enabled)
    } catch {
      setModels((prev) => ({ ...prev, [modelId]: !enabled }))
    }
  }

  const entries: ProviderEntry[] = PROVIDERS.map((p) => ({
    provider: p.id,
    apiKey: forms[p.id].apiKey,
    showKey: forms[p.id].showKey,
    saving: forms[p.id].saving,
    saved: forms[p.id].saved,
    enabled: forms[p.id].enabled,
    hasKey: forms[p.id].hasKey,
    onKeyChange: (v) => setForms((prev) => ({ ...prev, [p.id]: { ...prev[p.id], apiKey: v } })),
    onToggleShow: () => setForms((prev) => ({ ...prev, [p.id]: { ...prev[p.id], showKey: !prev[p.id].showKey } })),
    onSave: () => save(p.id),
    onToggleEnabled: (enabled) => toggleProvider(p.id, enabled),
  }))

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}
      <ProviderAccordion entries={entries} models={models} onToggleModel={toggleModel} />
    </div>
  )
}
