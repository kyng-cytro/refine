import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { ServerVersions } from "@refine/versions"
import { mmkvStorage } from "./storage"

interface VersionState {
  server: ServerVersions | null
  dismissed: string[]

  setServer: (server: ServerVersions | null) => void
  dismiss: (key: string) => void
}

export const useVersionStore = create<VersionState>()(
  persist(
    (set) => ({
      server: null,
      dismissed: [],

      setServer: (server) => set({ server }),

      dismiss: (key) => set((s) => ({ dismissed: [...s.dismissed, key] })),
    }),
    {
      name: "refine-versions",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ dismissed: s.dismissed }),
    },
  ),
)
