import { contextBridge } from "electron"

// Populated with the typed IPC bridge as features land.
contextBridge.exposeInMainWorld("refineDesktop", {})
