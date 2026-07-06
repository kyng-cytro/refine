import { useEffect } from "react"
import { useSettingsStore } from "@/store/settings-store"

export default function App() {
  const { hydrated, hydrate, connected, capabilities } = useSettingsStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) return null

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">Refine</h1>
      <p className="text-sm text-gray-500">
        {connected ? "Connected" : "Not connected"} · {capabilities?.platform}{" "}
        · keysim {capabilities?.keySim}
      </p>
    </div>
  )
}
