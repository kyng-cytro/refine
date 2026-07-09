import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Model, Tone } from "@refine/schemas"
import { mmkvStorage } from "./storage"

interface SettingsState {
  serverUrl: string
  sessionToken: string
  tones: Tone[]
  models: Model[]
  toneSlug: string
  modelId: string
  saveHistory: boolean
  privateHistory: boolean

  setServerConfig: (serverUrl: string, sessionToken: string) => void
  setSessionToken: (token: string) => void
  setTones: (tones: Tone[]) => void
  setModels: (models: Model[]) => void
  setTone: (slug: string) => void
  setModel: (modelId: string) => void
  setSaveHistory: (value: boolean) => void
  setPrivateHistory: (value: boolean) => void
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
      saveHistory: true,
      privateHistory: false,

      setServerConfig: (serverUrl, sessionToken) =>
        set({ serverUrl, sessionToken }),

      setSessionToken: (token) => set({ sessionToken: token }),

      setTones: (tones) => set({ tones }),

      setModels: (models) => set({ models }),

      setTone: (slug) => set({ toneSlug: slug }),

      setModel: (modelId) => set({ modelId }),

      setSaveHistory: (value) => set({ saveHistory: value }),

      setPrivateHistory: (value) => set({ privateHistory: value }),

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
      partialize: (s) => ({
        serverUrl: s.serverUrl,
        toneSlug: s.toneSlug,
        modelId: s.modelId,
        saveHistory: s.saveHistory,
        privateHistory: s.privateHistory,
      }),
    },
  ),
)
