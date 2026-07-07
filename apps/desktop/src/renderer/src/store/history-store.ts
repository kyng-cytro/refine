import { create } from "zustand"
import type { HistoryItem } from "@refine/schemas"

interface HistoryState {
  items: HistoryItem[]
  setItems: (items: HistoryItem[]) => void
  prependItem: (item: HistoryItem) => void
  removeItem: (id: string) => void
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  prependItem: (item) =>
    set((s) => ({ items: [item, ...s.items.filter((i) => i.id !== item.id)] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}))
