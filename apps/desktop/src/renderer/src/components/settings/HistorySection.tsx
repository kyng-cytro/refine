import { Surface } from "@/components/m3/Surface"
import { Switch } from "@/components/m3/Switch"
import { useSettingsStore } from "@/store/settings-store"
import { Section } from "./Section"

function Row({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-body-large text-on-surface">{title}</p>
        {description && (
          <p className="mt-0.5 text-body-small text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

export function HistorySection() {
  const { saveHistory, privateHistory, update } = useSettingsStore()

  return (
    <Section title="History">
      <Surface
        level={1}
        className="divide-y divide-outline-variant rounded-m3-md"
      >
        <Row
          title="Save history"
          description="Store refinements on the server so they show in Recents and sync across your devices."
        >
          <Switch
            checked={saveHistory}
            onCheckedChange={(v) => update({ saveHistory: v })}
          />
        </Row>

        <Row
          title="Private"
          description="Keep saved refinements out of the server admin dashboard."
        >
          <Switch
            checked={privateHistory && saveHistory}
            disabled={!saveHistory}
            onCheckedChange={(v) => update({ privateHistory: v })}
          />
        </Row>
      </Surface>
    </Section>
  )
}
