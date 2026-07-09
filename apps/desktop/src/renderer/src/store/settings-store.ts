import { create } from "zustand"
import type {
  SettingsSnapshot,
  SystemCapabilities,
  UpdatableSettings,
} from "../../../shared/types"
import { ipc } from "@/lib/ipc"

interface SettingsState extends SettingsSnapshot {
  hydrated: boolean
  capabilities: SystemCapabilities | null

  hydrate: () => Promise<void>
  update: (patch: UpdatableSettings) => Promise<boolean | undefined>
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  hydrated: false,
  capabilities: null,
  connected: false,
  serverUrl: "",
  deviceName: "",
  toneSlug: "",
  modelId: "",
  shortcut: "",
  cycleToneShortcut: "",
  autoApply: false,
  overlayCorner: "bottom-left",
  launchAtLogin: false,
  saveHistory: true,
  privateHistory: false,
  tones: [],
  models: [],

  hydrate: async () => {
    const [snapshot, capabilities] = await Promise.all([
      ipc.settings.get(),
      ipc.system.capabilities(),
    ])
    set({ ...snapshot, capabilities, hydrated: true })
    ipc.onStateChanged((next) => set(next))
  },

  update: async (patch) => {
    const { snapshot, shortcutOk } = await ipc.settings.update(patch)
    set(snapshot)
    return shortcutOk
  },
}))
