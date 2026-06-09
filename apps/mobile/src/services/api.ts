import { createClient } from "@refine/sdk"
import { useSettingsStore } from "@/store/settings-store"

export const getApiClient = () => {
  const { serverUrl, sessionToken } = useSettingsStore.getState()
  return createClient({ baseURL: serverUrl, sessionToken })
}
