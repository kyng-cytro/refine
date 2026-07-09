import { getApiClient } from "@/services/api"
import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"

export const refreshAll = async (): Promise<void> => {
  const { serverUrl, sessionToken } = useSettingsStore.getState()
  if (!serverUrl || !sessionToken) return

  const client = getApiClient()

  const onUnauth = (e: unknown) => {
    if (
      (e as any)?.status === 401 ||
      String((e as any)?.message).includes("401")
    ) {
      useSettingsStore.getState().clearServerConfig()
    }
  }

  await Promise.allSettled([
    client.auth.me().catch(onUnauth),
    client.tones
      .list()
      .then(useSettingsStore.getState().setTones)
      .catch(onUnauth),
    client.history
      .list({ limit: 50 })
      .then((r) => useHistoryStore.getState().setItems(r.data))
      .catch(onUnauth),
    client.providers
      .list()
      .then((r) => {
        const models = r.providers
          .flatMap((p) => p.models)
          .filter((m) => m.enabledByUser !== false)
        const { setModels, modelId, setModel } = useSettingsStore.getState()
        setModels(models)
        if (!models.some((m) => m.id === modelId)) {
          setModel(models[0]?.id ?? "")
        }
      })
      .catch(onUnauth),
  ])
}
