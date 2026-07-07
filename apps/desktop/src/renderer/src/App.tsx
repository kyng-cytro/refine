import { useEffect } from "react"
import KitchenSink from "@/screens/KitchenSink"
import { useSettingsStore } from "@/store/settings-store"

export default function App() {
  const { hydrated, hydrate, connected, capabilities } = useSettingsStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) return null

  return (
    <div className="h-screen overflow-y-auto">
      <p className="p-4 text-body-small text-on-surface-variant">
        {connected ? "Connected" : "Not connected"} · {capabilities?.platform}{" "}
        · keysim {capabilities?.keySim}
      </p>
      <KitchenSink />
    </div>
  )
}
