import type { Model, Tone } from "@refine/schemas"

export type OverlayCorner =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right"

export type KeySimCapability = "full" | "manual"

export type OverlayState = {
  state: "refining" | "success" | "error"
  message?: string
}

export type SettingsSnapshot = {
  connected: boolean
  serverUrl: string
  deviceName: string
  toneSlug: string
  modelId: string
  shortcut: string
  autoApply: boolean
  overlayCorner: OverlayCorner
  launchAtLogin: boolean
  saveHistory: boolean
  privateHistory: boolean
  tones: Tone[]
  models: Model[]
}

export type UpdatableSettings = Partial<
  Pick<
    SettingsSnapshot,
    | "toneSlug"
    | "modelId"
    | "shortcut"
    | "autoApply"
    | "overlayCorner"
    | "launchAtLogin"
    | "saveHistory"
    | "privateHistory"
  >
>

export type UpdateResult = {
  snapshot: SettingsSnapshot
  shortcutOk?: boolean
}

export type SystemCapabilities = {
  platform: string
  keySim: KeySimCapability
  keySimReason?: string
  safeStorage: boolean
  hostname: string
}

export type PairInput = {
  serverUrl: string
  pairingToken: string
  deviceName: string
}

export type PairResult = {
  ok: boolean
  error?: string
}

export type PairIncoming = {
  token: string
  url: string
  name?: string
}
