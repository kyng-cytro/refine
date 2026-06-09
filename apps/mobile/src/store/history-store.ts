import { create } from "zustand"
import type { HistoryItem } from "@refine/schemas"

interface HistoryState {
  items: HistoryItem[]
  isLoading: boolean
  setItems: (items: HistoryItem[]) => void
  prependItem: (item: HistoryItem) => void
  removeItem: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  items: [],
  isLoading: false,

  setItems: (items) => set({ items }),

  prependItem: (item) => set((s) => ({ items: [item, ...s.items] })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  setLoading: (loading) => set({ isLoading: loading }),
}))
