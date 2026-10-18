import { create } from "zustand"
import type { VersionInfo } from "@refine/versions"
import { ipc } from "@/lib/ipc"

interface VersionState {
  info: VersionInfo | null
  hydrate: () => Promise<void>
}

export const useVersionStore = create<VersionState>()((set) => ({
  info: null,
  hydrate: async () => {
    set({ info: await ipc.versions.get() })
    ipc.onVersionsChanged((info) => set({ info }))
  },
}))
