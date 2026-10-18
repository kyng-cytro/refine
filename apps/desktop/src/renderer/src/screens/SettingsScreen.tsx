import { BehaviorSection } from "@/components/settings/BehaviorSection"
import { HistorySection } from "@/components/settings/HistorySection"
import { ProvidersSection } from "@/components/settings/ProvidersSection"
import { ServerSection } from "@/components/settings/ServerSection"
import { ShortcutsSection } from "@/components/settings/ShortcutsSection"
import { TonesSection } from "@/components/settings/TonesSection"
import { useVersionStore } from "@/store/version-store"

export default function SettingsScreen() {
  const info = useVersionStore((s) => s.info)

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <ServerSection />
      <ShortcutsSection />
      <BehaviorSection />
      <HistorySection />
      <ProvidersSection />
      <TonesSection />
      {info && (
        <p className="pt-4 text-center text-body-small text-on-surface-variant/60">
          Refine v{info.app}
          {info.server && ` · Server v${info.server}`}
        </p>
      )}
    </div>
  )
}
