import { state } from "./state"
import { showOverlay } from "./windows/overlay-window"

let last = 0

export const cycleModel = (): void => {
  const now = Date.now()
  if (now - last < 250) return
  last = now

  const { connected, models, modelId } = state.snapshot()
  if (!connected) {
    showOverlay({ state: "error", message: "Not connected" }, 2000)
    return
  }
  if (models.length === 0) {
    showOverlay({ state: "error", message: "No models available" }, 2000)
    return
  }

  const index = models.findIndex((m) => m.id === modelId)
  const next = models[(index + 1) % models.length]!
  state.update({ modelId: next.id })
  showOverlay({ state: "success", message: `Model: ${next.label}` }, 1400)
}
