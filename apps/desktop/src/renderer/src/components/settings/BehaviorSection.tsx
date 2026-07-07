import type { OverlayCorner } from "../../../../shared/types"
import { Surface } from "@/components/m3/Surface"
import { Switch } from "@/components/m3/Switch"
import { useSettingsStore } from "@/store/settings-store"
import { Section } from "./Section"
import { ShortcutRecorder } from "./ShortcutRecorder"

const CORNERS: { value: OverlayCorner; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
]

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

export function BehaviorSection() {
  const {
    autoApply,
    overlayCorner,
    launchAtLogin,
    capabilities,
    update,
  } = useSettingsStore()

  const manual = capabilities?.keySim === "manual"

  return (
    <Section title="Shortcut">
      <Surface level={1} className="divide-y divide-outline-variant rounded-m3-md">
        <div className="p-4">
          <p className="mb-1.5 text-body-large text-on-surface">
            Global shortcut
          </p>
          <ShortcutRecorder />
          {manual && capabilities?.keySimReason && (
            <p className="mt-2 rounded-m3-sm bg-surface-container-high px-3 py-2 text-body-small text-on-surface-variant">
              {capabilities.keySimReason}
            </p>
          )}
        </div>

        <Row
          title="Auto-apply refined text"
          description={
            manual
              ? "Unavailable in manual mode — the refined text is placed on the clipboard for you to paste."
              : "Paste the refined text back automatically after refining."
          }
        >
          <Switch
            checked={autoApply && !manual}
            disabled={manual}
            onCheckedChange={(v) => update({ autoApply: v })}
          />
        </Row>

        <Row title="Overlay position">
          <select
            value={overlayCorner}
            onChange={(e) =>
              update({ overlayCorner: e.target.value as OverlayCorner })
            }
            className="h-10 rounded-m3-xs border border-outline bg-surface-container px-3 text-body-medium text-on-surface outline-none focus:border-primary"
          >
            {CORNERS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Row>

        {capabilities?.platform !== "linux" && (
          <Row title="Launch at login">
            <Switch
              checked={launchAtLogin}
              onCheckedChange={(v) => update({ launchAtLogin: v })}
            />
          </Row>
        )}
      </Surface>
    </Section>
  )
}
