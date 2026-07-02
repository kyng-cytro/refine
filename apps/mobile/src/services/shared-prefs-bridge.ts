import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"
import { useSettingsStore } from "@/store/settings-store"
import type { NativeConfig } from "@/types/settings"

const isAndroid = Platform.OS === "android"

const SESSION_TOKEN_KEY = "refine_session_token"

const getModule = () => {
  if (!isAndroid) return null
  try {
    return require("refine-shared-prefs") as typeof import("refine-shared-prefs")
  } catch {
    return null
  }
}

export const syncActiveConfig = (): void => {
  const { serverUrl, sessionToken, modelId, toneSlug } =
    useSettingsStore.getState()

  void (
    sessionToken
      ? SecureStore.setItemAsync(SESSION_TOKEN_KEY, sessionToken)
      : SecureStore.deleteItemAsync(SESSION_TOKEN_KEY)
  ).catch(() => {})

  const mod = getModule()
  if (!mod) return

  const config: NativeConfig =
    !serverUrl || !sessionToken
      ? { configured: false, reason: "no_server" }
      : !toneSlug
        ? { configured: false, reason: "no_tone" }
        : !modelId
          ? { configured: false, reason: "no_model" }
          : {
              configured: true,
              serverUrl,
              sessionToken,
              modelId: modelId,
              toneSlug: toneSlug,
            }

  try {
    mod.set("sessionToken", sessionToken)
    mod.set("activeConfig", JSON.stringify(config))
  } catch (e) {
    console.warn("[bridge] syncActiveConfig failed:", e)
  }
}

export const loadSessionToken = async (): Promise<string> => {
  try {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY)
    if (token) return token
  } catch {}

  const mod = getModule()
  if (!mod) return ""
  try {
    return mod.get("sessionToken") ?? ""
  } catch {
    return ""
  }
}
