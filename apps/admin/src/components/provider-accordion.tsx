import { PROVIDERS, type ModelProvider, type Provider } from "@/lib/models"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Eye, EyeOff, Power, Save } from "lucide-react"

export interface ProviderEntry {
  provider: ModelProvider
  apiKey?: string
  showKey?: boolean
  onKeyChange?: (key: string) => void
  onToggleShow?: () => void
  saving?: boolean
  saved?: boolean
  onSave?: () => void
  enabled?: boolean
  hasKey?: boolean
  onToggleEnabled?: (enabled: boolean) => void
}

type Variant = "setup" | "providers" | "devices"

interface Props {
  variant: Variant
  entries: ProviderEntry[]
  models: Record<string, boolean>
  onToggleModel: (
    provider: ModelProvider,
    modelId: string,
    enabled: boolean,
  ) => void
}

export function ProviderAccordion({
  variant,
  entries,
  models,
  onToggleModel,
}: Props) {
  const showApiKey = variant !== "devices"
  const isManaged = variant === "providers"
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {PROVIDERS.map((p: Provider) => {
        const entry = entries.find((e) => e.provider === p.id)!
        const hasKey =
          entry.hasKey ?? (entry.apiKey ? !!entry.apiKey.trim() : false)
        const hasFreeModels = p.models.some((m) => m.free)

        return (
          <AccordionItem
            key={p.id}
            value={p.id}
            className="border rounded-lg px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4 [&>svg]:hidden">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground shrink-0 [&_svg]:h-6 [&_svg]:w-6"
                  dangerouslySetInnerHTML={{ __html: p.icon }}
                />
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {p.label}
                    {isManaged
                      ? entry.saved && (
                          <span className="text-xs font-normal text-primary">
                            Key saved ✓
                          </span>
                        )
                      : hasKey && (
                          <span className="text-xs font-normal text-primary">
                            ✓ configured
                          </span>
                        )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.description}
                  </p>
                </div>
                {hasFreeModels && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    Free models
                  </span>
                )}
                {entry.onToggleEnabled && (
                  <button
                    type="button"
                    disabled={!hasKey}
                    className={`shrink-0 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      entry.enabled
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={
                      !hasKey
                        ? showApiKey
                          ? "Add an API key first"
                          : "Provider not available on this server"
                        : entry.enabled
                          ? "Disable provider"
                          : "Enable provider"
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      entry.onToggleEnabled!(!entry.enabled)
                    }}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 space-y-4">
              {showApiKey && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>API Key</Label>
                    <a
                      href={p.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get API key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={entry.showKey ? "text" : "password"}
                        placeholder={p.placeholder}
                        value={entry.apiKey ?? ""}
                        onChange={(e) => entry.onKeyChange!(e.target.value)}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={entry.onToggleShow}
                      >
                        {entry.showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {entry.onSave && (
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={!entry.apiKey?.trim() || entry.saving}
                        onClick={entry.onSave}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Models</Label>
                {p.models.map((m) => {
                  const active = isManaged
                    ? (models[m.id] ?? false)
                    : hasKey && models[m.id]
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                        hasKey
                          ? "cursor-pointer hover:bg-muted"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        hasKey && onToggleModel(p.id, m.id, !active)
                      }
                    >
                      <span className="text-sm">{m.label}</span>
                      {m.free ? (
                        <span className="text-xs font-medium text-emerald-600 ml-2 mr-auto">
                          Free
                        </span>
                      ) : (
                        m.cost && (
                          <span className="text-xs text-muted-foreground ml-2 mr-auto">
                            ${m.cost.input} in / ${m.cost.output} out per 1M
                          </span>
                        )
                      )}
                      <ToggleSwitch active={!!active} />
                    </div>
                  )
                })}
                {showApiKey && !isManaged && !hasKey && (
                  <p className="px-3 pt-1 text-xs text-muted-foreground">
                    Add an API key to enable models
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
