import { createMMKV } from "react-native-mmkv"
import { StateStorage } from "zustand/middleware"

const mmkv = createMMKV({ id: "refine-store" })

export const mmkvStorage: StateStorage = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: (key) => mmkv.remove(key),
}
