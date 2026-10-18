import { app } from "electron"
import { createClient, type RefineClient } from "@refine/sdk"
import { SERVER_HEADER } from "@refine/versions"
import type { PairInput, PairResult } from "../shared/types"
import { state } from "./state"
import { knownServerVersion, setServerVersions } from "./versions"

let cached: { key: string; client: RefineClient } | null = null

const onResponse = (response: Response): void => {
  const version = response.headers.get(SERVER_HEADER)
  if (response.status === 426 || (version && version !== knownServerVersion())) {
    void checkVersions()
  }
}

const checkVersions = async (): Promise<void> => {
  const baseURL = state.serverUrl
  if (!baseURL) return setServerVersions(null)
  try {
    setServerVersions(
      await createClient({ baseURL, clientVersion: app.getVersion() }).meta(),
    )
  } catch {}
}

export const getClient = (): RefineClient | null => {
  const baseURL = state.serverUrl
  const sessionToken = state.sessionToken
  if (!baseURL || !sessionToken) return null
  const key = `${baseURL}|${sessionToken}`
  if (cached?.key !== key) {
    cached = {
      key,
      client: createClient({
        baseURL,
        sessionToken,
        clientVersion: app.getVersion(),
        onResponse,
      }),
    }
  }
  return cached.client
}

export const apiError = (e: unknown): string => {
  const err = e as { data?: { message?: string }; message?: string }
  return err?.data?.message ?? err?.message ?? "Connection failed"
}

export const bootstrapCatalog = async (): Promise<void> => {
  const client = getClient()
  if (!client) return
  void checkVersions()
  const [tones, { providers }] = await Promise.all([
    client.tones.list(),
    client.providers.list(),
  ])
  const models = providers
    .flatMap((p) => p.models)
    .filter((m) => m.enabledByUser !== false)
  state.setCatalog(tones, models)
}

export const pairAndBootstrap = async ({
  serverUrl,
  pairingToken,
  deviceName,
}: PairInput): Promise<PairResult> => {
  const url = serverUrl.trim().replace(/\/$/, "")
  const token = pairingToken.trim()
  const name = deviceName.trim() || "My Desktop"

  if (!url) return { ok: false, error: "Server URL is required" }
  if (!token) return { ok: false, error: "Pairing token is required" }

  try {
    const { sessionToken } = await createClient({
      baseURL: url,
      clientVersion: app.getVersion(),
    }).auth.pair({
      pairingToken: token,
      deviceName: name,
    })
    state.setServerConfig(url, sessionToken, name)
    await bootstrapCatalog()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: apiError(e) }
  }
}
