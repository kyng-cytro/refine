import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron"
import type {
  CreateTone,
  HistoryItem,
  ProvidersResponse,
  RefineRequest,
  RefineResponse,
  Tone,
  UpdateTone,
} from "@refine/schemas"
import { EVENTS, IPC } from "../shared/ipc"
import type {
  OverlayState,
  PairIncoming,
  PairInput,
  PairResult,
  SettingsSnapshot,
  SystemCapabilities,
  UpdatableSettings,
  UpdateResult,
} from "../shared/types"

const subscribe = <T>(channel: string, callback: (payload: T) => void) => {
  const listener = (_e: IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

const api = {
  settings: {
    get: (): Promise<SettingsSnapshot> => ipcRenderer.invoke(IPC.settingsGet),
    update: (patch: UpdatableSettings): Promise<UpdateResult> =>
      ipcRenderer.invoke(IPC.settingsUpdate, patch),
  },
  session: {
    pair: (input: PairInput): Promise<PairResult> =>
      ipcRenderer.invoke(IPC.sessionPair, input),
    disconnect: (): Promise<void> => ipcRenderer.invoke(IPC.sessionDisconnect),
    bootstrap: (): Promise<void> => ipcRenderer.invoke(IPC.sessionBootstrap),
    consumePendingPair: (): Promise<PairIncoming | null> =>
      ipcRenderer.invoke(IPC.pairConsume),
  },
  refine: (body: RefineRequest): Promise<RefineResponse> =>
    ipcRenderer.invoke(IPC.refineRun, body),
  tones: {
    list: (): Promise<Tone[]> => ipcRenderer.invoke(IPC.tonesList),
    create: (body: CreateTone): Promise<Tone> =>
      ipcRenderer.invoke(IPC.tonesCreate, body),
    update: (id: string, body: UpdateTone): Promise<Tone> =>
      ipcRenderer.invoke(IPC.tonesUpdate, id, body),
    delete: (id: string): Promise<void> =>
      ipcRenderer.invoke(IPC.tonesDelete, id),
  },
  providers: {
    list: (): Promise<ProvidersResponse> =>
      ipcRenderer.invoke(IPC.providersList),
  },
  history: {
    list: (limit?: number): Promise<HistoryItem[]> =>
      ipcRenderer.invoke(IPC.historyList, limit),
    delete: (id: string): Promise<void> =>
      ipcRenderer.invoke(IPC.historyDelete, id),
  },
  system: {
    capabilities: (): Promise<SystemCapabilities> =>
      ipcRenderer.invoke(IPC.systemCapabilities),
    setShortcutRecording: (recording: boolean): Promise<void> =>
      ipcRenderer.invoke(IPC.shortcutSetRecording, recording),
  },
  onStateChanged: (cb: (snapshot: SettingsSnapshot) => void) =>
    subscribe(EVENTS.stateChanged, cb),
  onOverlayState: (cb: (overlay: OverlayState) => void) =>
    subscribe(EVENTS.overlayState, cb),
  onHistoryPrepend: (cb: (entry: HistoryItem) => void) =>
    subscribe(EVENTS.historyPrepend, cb),
  onPairIncoming: (cb: (pair: PairIncoming) => void) =>
    subscribe(EVENTS.pairIncoming, cb),
}

export type RefineDesktopApi = typeof api

contextBridge.exposeInMainWorld("refineDesktop", api)
