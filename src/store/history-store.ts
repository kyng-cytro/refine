import { create } from 'zustand';

import { HistoryItem } from '@/types/history';

interface HistoryState {
  items: HistoryItem[];
  addItem: (item: HistoryItem) => void;
  deleteItem: (id: string) => void;
  setItems: (items: HistoryItem[]) => void;
}

// No MMKV persist — SharedPreferences is canonical, loaded fresh on foreground
export const useHistoryStore = create<HistoryState>()((set) => ({
  items: [],

  addItem: (item) =>
    set((s) => ({ items: [item, ...s.items].slice(0, 50) })),

  deleteItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  setItems: (items) => set({ items }),
}));
