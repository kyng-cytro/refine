import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AdminProviderState } from "@refine/schemas"
import { PROVIDERS, getModels, type ModelProvider } from "@refine/models"
import {
  ProviderAccordion,
  type ProviderEntry,
} from "@/components/provider-accordion"

interface FormState {
  apiKey: string
  showKey: boolean
  saving: boolean
  saved: boolean
  enabled: boolean
  hasKey: boolean
}

type Forms = Record<ModelProvider, FormState>

const defaultForms = () =>
  Object.fromEntries(
    PROVIDERS.map((p) => [
      p.id,
      {
        apiKey: "",
        showKey: false,
        saving: false,
        saved: false,
        enabled: false,
        hasKey: false,
      },
    ]),
  ) as Forms

export default function ProvidersTab() {
  const [forms, setForms] = useState<Forms>(defaultForms)
  const [models, setModels] = useState<Record<string, boolean>>(
    Object.fromEntries(getModels().map((m) => [m.id, false])),
  )
  const [error, setError] = useState("")

  const updateForm = (p: ModelProvider, patch: Partial<FormState>) =>
    setForms((prev) => ({ ...prev, [p]: { ...prev[p], ...patch } }))

  useEffect(() => {
    api.providers
      .list()
      .then((states: AdminProviderState[]) => {
        for (const { provider, enabled, hasKey } of states) {
          updateForm(provider, { enabled, hasKey })
        }
        const enabledModels = states.flatMap((p) =>
          p.models.map((m) => [m.id, m.enabled] as const),
        )
        setModels((prev) => ({ ...prev, ...Object.fromEntries(enabledModels) }))
      })
      .catch(() => {})
  }, [])

  const save = async (p: ModelProvider) => {
    const key = forms[p].apiKey.trim()
    if (!key) return
    updateForm(p, { saving: true, saved: false })
    setError("")
    try {
      await api.providers.upsert(p, key, forms[p].enabled)
      updateForm(p, { saving: false, saved: true, hasKey: true, apiKey: "" })
      setTimeout(() => updateForm(p, { saved: false }), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      updateForm(p, { saving: false })
    }
  }

  const toggleProvider = async (p: ModelProvider, enabled: boolean) => {
    updateForm(p, { enabled })
    try {
      await api.providers.upsert(p, undefined, enabled)
    } catch {
      updateForm(p, { enabled: !enabled })
    }
  }

  const toggleModel = async (
    provider: ModelProvider,
    modelId: string,
    enabled: boolean,
  ) => {
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
    onKeyChange: (apiKey) => updateForm(p.id, { apiKey }),
    onToggleShow: () => updateForm(p.id, { showKey: !forms[p.id].showKey }),
    onSave: () => save(p.id),
    onToggleEnabled: (enabled) => toggleProvider(p.id, enabled),
  }))

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}
      <ProviderAccordion
        variant="providers"
        entries={entries}
        models={models}
        onToggleModel={toggleModel}
      />
    </div>
  )
}
