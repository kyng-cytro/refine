import { BehaviorSection } from "@/components/settings/BehaviorSection"
import { ProvidersSection } from "@/components/settings/ProvidersSection"
import { ServerSection } from "@/components/settings/ServerSection"
import { TonesSection } from "@/components/settings/TonesSection"

export default function SettingsScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <ServerSection />
      <BehaviorSection />
      <ProvidersSection />
      <TonesSection />
    </div>
  )
}
