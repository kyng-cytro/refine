import { createClient } from "@refine/sdk"
import { useSettingsStore } from "@/store/settings-store"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"

export interface PairInput {
  serverUrl: string
  pairingToken: string
  deviceName: string
}

export interface PairResult {
  ok: boolean
  error?: string
}

export const pairAndBootstrap = async ({
  serverUrl,
  pairingToken,
  deviceName,
}: PairInput): Promise<PairResult> => {
  const url = serverUrl.trim().replace(/\/$/, "")
  const token = pairingToken.trim()
  const name = deviceName.trim() || "My Phone"

  if (!url) return { ok: false, error: "Server URL is required" }
  if (!token) return { ok: false, error: "Pairing token is required" }

  try {
    const { sessionToken } = await createClient({ baseURL: url }).auth.pair({
      pairingToken: token,
      deviceName: name,
    })

    const store = useSettingsStore.getState()
    store.setServerConfig(url, sessionToken)
    syncActiveConfig()

    const authed = createClient({ baseURL: url, sessionToken })
    const [tones, { providers }] = await Promise.all([
      authed.tones.list(),
      authed.providers.list(),
    ])

    if (tones.length) {
      store.setTones(tones)
      store.setTone(tones[0].slug)
    }

    const models = providers
      .flatMap((p) => p.models)
      .filter((m) => m.enabledByUser !== false)
    store.setModels(models)
    if (models.length) store.setModel(models[0].id)

    return { ok: true }
  } catch (e: any) {
    return {
      ok: false,
      error: e?.data?.message ?? e?.message ?? "Connection failed",
    }
  }
}
