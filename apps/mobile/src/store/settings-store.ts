import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Model, Tone } from "@refine/schemas"
import { mmkvStorage } from "./storage"

interface SettingsState {
  serverUrl: string
  // sessionToken is NOT persisted here — held in memory and synced to EncryptedSharedPreferences
  sessionToken: string
  // Cached from server on startup
  tones: Tone[]
  models: Model[]
  toneSlug: string
  modelId: string

  setServerConfig: (serverUrl: string, sessionToken: string) => void
  setSessionToken: (token: string) => void
  setTones: (tones: Tone[]) => void
  setModels: (models: Model[]) => void
  setTone: (slug: string) => void
  setModel: (modelId: string) => void
  clearServerConfig: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      serverUrl: "",
      sessionToken: "",
      tones: [],
      models: [],
      toneSlug: "",
      modelId: "",

      setServerConfig: (serverUrl, sessionToken) =>
        set({ serverUrl, sessionToken }),

      setSessionToken: (token) => set({ sessionToken: token }),

      setTones: (tones) => set({ tones }),

      setModels: (models) => set({ models }),

      setTone: (slug) => set({ toneSlug: slug }),

      setModel: (modelId) => set({ modelId }),

      clearServerConfig: () =>
        set({
          serverUrl: "",
          sessionToken: "",
          tones: [],
          models: [],
          toneSlug: "",
          modelId: "",
        }),
    }),
    {
      name: "refine-settings",
      storage: createJSONStorage(() => mmkvStorage),
      // sessionToken is NOT persisted to MMKV — only to EncryptedSharedPreferences via bridge
      partialize: (s) => ({
        serverUrl: s.serverUrl,
        toneSlug: s.toneSlug,
        modelId: s.modelId,
      }),
    },
  ),
)
