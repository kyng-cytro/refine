import { state } from "./state"
import { showOverlay } from "./windows/overlay-window"

let last = 0

export const cycleTone = (): void => {
  const now = Date.now()
  if (now - last < 250) return
  last = now

  const { connected, tones, toneSlug } = state.snapshot()
  if (!connected) {
    showOverlay({ state: "error", message: "Not connected" }, 2000)
    return
  }
  if (tones.length === 0) {
    showOverlay({ state: "error", message: "No tones available" }, 2000)
    return
  }

  const index = tones.findIndex((t) => t.slug === toneSlug)
  const next = tones[(index + 1) % tones.length]!
  state.update({ toneSlug: next.slug })
  showOverlay({ state: "success", message: `Tone: ${next.name}` }, 1400)
}
