import { useState } from "react"

import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"
import { apiError, getApiClient } from "@/services/api"

interface UseRefineResult {
  refine: (text: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export const useRefine = (): UseRefineResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { modelId, toneSlug, saveHistory, privateHistory } = useSettingsStore()
  const prependItem = useHistoryStore((s) => s.prependItem)

  const refine = async (text: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getApiClient()
      const { refined } = await client.refine({
        text,
        modelId,
        toneSlug,
        save: saveHistory,
        private: privateHistory,
      })

      if (saveHistory) {
        prependItem({
          id: String(Date.now()),
          source: text,
          refined,
          modelId,
          toneSlug,
          createdAt: Date.now(),
        })
      }

      return true
    } catch (e) {
      setError(apiError(e, "Something went wrong"))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { refine, isLoading, error, clearError: () => setError(null) }
}
