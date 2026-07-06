import type { RefineDesktopApi } from "../../../preload"

declare global {
  interface Window {
    refineDesktop: RefineDesktopApi
  }
}

export const ipc = window.refineDesktop
