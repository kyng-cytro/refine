import { useState } from "react"

import { useHistoryStore } from "@/store/history-store"
import { useSettingsStore } from "@/store/settings-store"
import { getApiClient } from "@/services/api"

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
        modelId: modelId,
        toneSlug: toneSlug,
        save: saveHistory,
        private: privateHistory,
      })

      if (saveHistory) {
        prependItem({
          id: String(Date.now()),
          source: text,
          refined,
          modelId: modelId,
          toneSlug: toneSlug,
          createdAt: Date.now(),
        })
      }

      return true
    } catch (e: any) {
      const msg = e?.data?.message ?? e?.message ?? "Something went wrong"
      setError(msg)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { refine, isLoading, error, clearError: () => setError(null) }
}
