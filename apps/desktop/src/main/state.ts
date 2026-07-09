import { safeStorage } from "electron"
import type { Model, Tone } from "@refine/schemas"
import type {
  OverlayCorner,
  SettingsSnapshot,
  UpdatableSettings,
} from "../shared/types"
import { JsonStore } from "./json-store"

type PersistedSettings = {
  serverUrl: string
  deviceName: string
  toneSlug: string
  modelId: string
  shortcut: string
  cycleToneShortcut: string
  autoApply: boolean
  overlayCorner: OverlayCorner
  launchAtLogin: boolean
  saveHistory: boolean
  privateHistory: boolean
  encryptedSessionToken: string
  plainSessionToken: string
}

const DEFAULTS: PersistedSettings = {
  serverUrl: "",
  deviceName: "",
  toneSlug: "",
  modelId: "",
  shortcut: "CommandOrControl+Alt+R",
  cycleToneShortcut: "CommandOrControl+Alt+T",
  autoApply: false,
  overlayCorner: "bottom-left",
  launchAtLogin: false,
  saveHistory: true,
  privateHistory: false,
  encryptedSessionToken: "",
  plainSessionToken: "",
}

class AppState {
  private store = new JsonStore<PersistedSettings>("settings.json", DEFAULTS)
  private listeners = new Set<() => void>()

  tones: Tone[] = []
  models: Model[] = []

  get sessionToken(): string {
    const encrypted = this.store.get("encryptedSessionToken")
    if (encrypted) {
      try {
        return safeStorage.decryptString(Buffer.from(encrypted, "base64"))
      } catch {
        return ""
      }
    }
    return this.store.get("plainSessionToken")
  }

  get connected(): boolean {
    return Boolean(this.store.get("serverUrl") && this.sessionToken)
  }

  get serverUrl(): string {
    return this.store.get("serverUrl")
  }

  get toneSlug(): string {
    return this.store.get("toneSlug")
  }

  get modelId(): string {
    return this.store.get("modelId")
  }

  get shortcut(): string {
    return this.store.get("shortcut")
  }

  get cycleToneShortcut(): string {
    return this.store.get("cycleToneShortcut")
  }

  get autoApply(): boolean {
    return this.store.get("autoApply")
  }

  get saveHistory(): boolean {
    return this.store.get("saveHistory")
  }

  get privateHistory(): boolean {
    return this.store.get("privateHistory")
  }

  get overlayCorner(): OverlayCorner {
    return this.store.get("overlayCorner")
  }

  get launchAtLogin(): boolean {
    return this.store.get("launchAtLogin")
  }

  snapshot(): SettingsSnapshot {
    return {
      connected: this.connected,
      serverUrl: this.store.get("serverUrl"),
      deviceName: this.store.get("deviceName"),
      toneSlug: this.store.get("toneSlug"),
      modelId: this.store.get("modelId"),
      shortcut: this.store.get("shortcut"),
      cycleToneShortcut: this.store.get("cycleToneShortcut"),
      autoApply: this.store.get("autoApply"),
      overlayCorner: this.store.get("overlayCorner"),
      launchAtLogin: this.store.get("launchAtLogin"),
      saveHistory: this.store.get("saveHistory"),
      privateHistory: this.store.get("privateHistory"),
      tones: this.tones,
      models: this.models,
    }
  }

  update(patch: UpdatableSettings): void {
    this.store.set(patch)
    this.emit()
  }

  setServerConfig(
    serverUrl: string,
    sessionToken: string,
    deviceName: string,
  ): void {
    const secure = safeStorage.isEncryptionAvailable()
    this.store.set({
      serverUrl,
      deviceName,
      encryptedSessionToken: secure
        ? safeStorage.encryptString(sessionToken).toString("base64")
        : "",
      plainSessionToken: secure ? "" : sessionToken,
    })
    this.emit()
  }

  clearServerConfig(): void {
    this.tones = []
    this.models = []
    this.store.set({
      serverUrl: "",
      deviceName: "",
      toneSlug: "",
      modelId: "",
      encryptedSessionToken: "",
      plainSessionToken: "",
    })
    this.emit()
  }

  setCatalog(tones: Tone[], models: Model[]): void {
    this.tones = tones
    this.models = models
    const patch: UpdatableSettings = {}
    if (!tones.some((t) => t.slug === this.toneSlug)) {
      patch.toneSlug = tones[0]?.slug ?? ""
    }
    if (!models.some((m) => m.id === this.modelId)) {
      patch.modelId = models[0]?.id ?? ""
    }
    if (Object.keys(patch).length) this.store.set(patch)
    this.emit()
  }

  setTones(tones: Tone[]): void {
    this.setCatalog(tones, this.models)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }
}

export const state = new AppState()
