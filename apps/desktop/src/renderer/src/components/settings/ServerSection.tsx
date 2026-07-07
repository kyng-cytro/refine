import { Link2Off, Server } from "lucide-react"
import { Button } from "@/components/m3/Button"
import { Surface } from "@/components/m3/Surface"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"
import { Section } from "./Section"

export function ServerSection() {
  const serverUrl = useSettingsStore((s) => s.serverUrl)
  const deviceName = useSettingsStore((s) => s.deviceName)

  return (
    <Section title="Server">
      <Surface level={1} className="flex items-center gap-3 rounded-m3-md p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Server className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-large text-on-surface">
            {serverUrl || "Not connected"}
          </p>
          <p className="truncate text-body-small text-on-surface-variant">
            {deviceName || "This device"}
          </p>
        </div>
      </Surface>
      <Button
        variant="outlined"
        onClick={() => ipc.session.disconnect()}
        className="mt-3 border-error text-error"
      >
        <Link2Off className="h-4 w-4" />
        Disconnect
      </Button>
    </Section>
  )
}
