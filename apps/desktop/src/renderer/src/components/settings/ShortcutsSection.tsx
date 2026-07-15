import { Surface } from "@/components/m3/Surface"
import { useSettingsStore } from "@/store/settings-store"
import { Section } from "./Section"
import { ShortcutRecorder } from "./ShortcutRecorder"

export function ShortcutsSection() {
  const capabilities = useSettingsStore((s) => s.capabilities)
  const manual = capabilities?.keySim === "manual"

  return (
    <Section title="Shortcuts">
      <Surface
        level={1}
        className="divide-y divide-outline-variant rounded-m3-md"
      >
        <div className="p-4">
          <p className="mb-1.5 text-body-large text-on-surface">
            Refine selection
          </p>
          <ShortcutRecorder settingKey="shortcut" />
          {manual && capabilities?.keySimReason && (
            <p className="mt-2 rounded-m3-sm bg-surface-container-high px-3 py-2 text-body-small text-on-surface-variant">
              {capabilities.keySimReason}
            </p>
          )}
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-body-large text-on-surface">Cycle tone</p>
          <ShortcutRecorder settingKey="cycleToneShortcut" optional />
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-body-large text-on-surface">Cycle model</p>
          <ShortcutRecorder settingKey="cycleModelShortcut" optional />
        </div>
      </Surface>
    </Section>
  )
}
