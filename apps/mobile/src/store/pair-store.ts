import { create } from "zustand"
import type { PairParams } from "@/components/PairConfirmDialog"

interface PairStore {
  params: PairParams | null
  set: (params: PairParams | null) => void
}

export const usePairStore = create<PairStore>((setState) => ({
  params: null,
  set: (params) => setState({ params }),
}))
