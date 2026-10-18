import { state } from "./state"
import { showOverlay } from "./windows/overlay-window"

const throttle = (fn: () => void, ms: number) => {
  let last = 0
  return () => {
    const now = Date.now()
    if (now - last < ms) return
    last = now
    fn()
  }
}

const nextAfter = <T>(items: T[], isCurrent: (item: T) => boolean): T =>
  items[(items.findIndex(isCurrent) + 1) % items.length]!

const showError = (message: string) =>
  showOverlay({ state: "error", message }, 2000)

const showSelected = (message: string) =>
  showOverlay({ state: "success", message }, 1400)

export const cycleTone = throttle(() => {
  const { connected, tones, toneSlug } = state.snapshot()
  if (!connected) return showError("Not connected")
  if (tones.length === 0) return showError("No tones available")
  const next = nextAfter(tones, (t) => t.slug === toneSlug)
  state.update({ toneSlug: next.slug })
  showSelected(`Tone: ${next.name}`)
}, 250)

export const cycleModel = throttle(() => {
  const { connected, models, modelId } = state.snapshot()
  if (!connected) return showError("Not connected")
  if (models.length === 0) return showError("No models available")
  const next = nextAfter(models, (m) => m.id === modelId)
  state.update({ modelId: next.id })
  showSelected(`Model: ${next.label}`)
}, 250)
