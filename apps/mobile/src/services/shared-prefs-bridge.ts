import { Platform } from "react-native"
import { useSettingsStore } from "@/store/settings-store"
import type { NativeConfig } from "@/types/settings"

const isAndroid = Platform.OS === "android"

const getModule = () => {
  if (!isAndroid) return null
  try {
    return require("refine-shared-prefs") as typeof import("refine-shared-prefs")
  } catch {
    return null
  }
}

/**
 * Sync server config to native SharedPreferences so ProcessTextActivity
 * can call the server without React Native running.
 */
export const syncActiveConfig = (): void => {
  const mod = getModule()
  if (!mod) return

  const { serverUrl, sessionToken, modelId, toneSlug } =
    useSettingsStore.getState()

  try {
    mod.setEncrypted("sessionToken", sessionToken)
  } catch {}

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
    mod.set("serverUrl", serverUrl)
    mod.setEncrypted("activeConfig", JSON.stringify(config))
  } catch (e) {
    console.warn("[bridge] syncActiveConfig failed:", e)
  }
}

export const loadSessionTokenFromNative = (): string => {
  const mod = getModule()
  if (!mod) return ""
  try {
    return mod.getEncrypted("sessionToken") ?? ""
  } catch {
    return ""
  }
}
