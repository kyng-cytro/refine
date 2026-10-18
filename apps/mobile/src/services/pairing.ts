import { createClient } from "@refine/sdk"
import { useSettingsStore } from "@/store/settings-store"
import { syncActiveConfig } from "@/services/shared-prefs-bridge"
import { apiError } from "@/services/api"
import { refreshAll } from "@/services/refresh"
import { APP_VERSION } from "@/services/versions"

interface PairInput {
  serverUrl: string
  pairingToken: string
  deviceName: string
}

interface PairResult {
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
    const { sessionToken } = await createClient({
      baseURL: url,
      clientVersion: APP_VERSION,
    }).auth.pair({
      pairingToken: token,
      deviceName: name,
    })
    useSettingsStore.getState().setServerConfig(url, sessionToken)
    syncActiveConfig()
    await refreshAll()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: apiError(e, "Connection failed") }
  }
}
