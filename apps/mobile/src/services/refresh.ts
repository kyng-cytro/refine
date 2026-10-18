import type { Model, Tone } from "@refine/schemas"
import { getApiClient } from "@/services/api"
import { checkVersions } from "@/services/versions"
import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"

const onUnauthorized = (e: unknown) => {
  if ((e as { status?: number })?.status === 401) {
    useSettingsStore.getState().clearServerConfig()
  }
}

const applyTones = (tones: Tone[]) => {
  const { setTones, toneSlug, setTone } = useSettingsStore.getState()
  setTones(tones)
  if (!tones.some((t) => t.slug === toneSlug)) setTone(tones[0]?.slug ?? "")
}

const applyModels = (models: Model[]) => {
  const { setModels, modelId, setModel } = useSettingsStore.getState()
  setModels(models)
  if (!models.some((m) => m.id === modelId)) setModel(models[0]?.id ?? "")
}

export const refreshAll = async (): Promise<void> => {
  const { serverUrl, sessionToken } = useSettingsStore.getState()
  if (!serverUrl || !sessionToken) return

  const client = getApiClient()

  await Promise.allSettled([
    checkVersions(),
    client.auth.me().catch(onUnauthorized),
    client.tones.list().then(applyTones).catch(onUnauthorized),
    client.history
      .list({ limit: 50 })
      .then((r) => useHistoryStore.getState().setItems(r.data))
      .catch(onUnauthorized),
    client.providers
      .list()
      .then((r) =>
        applyModels(
          r.providers
            .flatMap((p) => p.models)
            .filter((m) => m.enabledByUser !== false),
        ),
      )
      .catch(onUnauthorized),
  ])
}
