import { useEffect, useState } from "react"
import type { ProvidersResponse } from "@refine/schemas"
import { Check } from "lucide-react"
import { Surface } from "@/components/m3/Surface"
import { ProviderIcon } from "@/components/ProviderIcon"
import { ipc } from "@/lib/ipc"
import { Section } from "./Section"

export function ProvidersSection() {
  const [data, setData] = useState<ProvidersResponse | null>(null)

  useEffect(() => {
    ipc.providers.list().then(setData).catch(() => {})
  }, [])

  const providers = (data?.providers ?? []).filter((p) => p.enabled)

  return (
    <Section title="Providers">
      {providers.length === 0 ? (
        <p className="text-body-medium text-on-surface-variant/60">
          No providers enabled
        </p>
      ) : (
        <Surface level={1} className="divide-y divide-outline-variant rounded-m3-md">
          {providers.map((p) => {
            const enabledModels = p.models.filter(
              (m) => m.enabledByUser !== false,
            ).length
            return (
              <div key={p.provider} className="flex items-center gap-3 p-4">
                {p.icon ? (
                  <ProviderIcon svg={p.icon} size={20} className="text-on-surface" />
                ) : (
                  <span className="h-5 w-5" />
                )}
                <span className="flex-1 text-body-large capitalize text-on-surface">
                  {p.provider}
                </span>
                <span className="text-body-small text-on-surface-variant">
                  {enabledModels} model{enabledModels === 1 ? "" : "s"}
                </span>
                <Check className="h-4 w-4 text-primary" />
              </div>
            )
          })}
        </Surface>
      )}
    </Section>
  )
}
