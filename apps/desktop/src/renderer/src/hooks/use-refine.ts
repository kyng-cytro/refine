import { useState } from "react"
import { ipc } from "@/lib/ipc"
import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"

export function useRefine() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { modelId, toneSlug } = useSettingsStore()
  const prependItem = useHistoryStore((s) => s.prependItem)

  const refine = async (text: string): Promise<boolean> => {
    if (!modelId || !toneSlug) {
      setError("Select a model and tone first")
      return false
    }
    setError("")
    setIsLoading(true)
    try {
      const { refined } = await ipc.refine({ text, modelId, toneSlug })
      prependItem({
        id: `local-${text.length}-${text.slice(0, 8)}`,
        source: text,
        refined,
        modelId,
        toneSlug,
        createdAt: Date.now(),
      })
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refine failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { refine, isLoading, error, clearError: () => setError("") }
}
