import { useEffect } from "react"
import { useLocalSearchParams, router } from "expo-router"
import { usePairStore } from "@/store/pair-store"

export default function PairScreen() {
  const { token, url, name } = useLocalSearchParams<{ token: string; url: string; name: string }>()

  useEffect(() => {
    if (token && url) {
      usePairStore.getState().set({
        token,
        url,
        name: name || "My Phone",
      })
    }
    router.replace("/")
  }, [])

  return null
}
