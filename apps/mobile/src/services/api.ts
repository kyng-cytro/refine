import { createClient } from "@refine/sdk"
import { APP_VERSION, onResponse } from "@/services/versions"
import { useSettingsStore } from "@/store/settings-store"

export const apiError = (e: unknown, fallback: string): string => {
  const err = e as { data?: { message?: string }; message?: string }
  return err?.data?.message ?? err?.message ?? fallback
}

export const getApiClient = () => {
  const { serverUrl, sessionToken } = useSettingsStore.getState()
  return createClient({
    baseURL: serverUrl,
    sessionToken,
    clientVersion: APP_VERSION,
    onResponse,
  })
}
