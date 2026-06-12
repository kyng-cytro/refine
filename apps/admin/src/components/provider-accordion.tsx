import { MODELS, PROVIDERS, type ModelProvider } from "@/lib/models"
import { PROVIDER_META } from "@/lib/provider-meta"
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
import { Eye, EyeOff, Power, Save } from "lucide-react"

export interface ProviderEntry {
  provider: ModelProvider
  apiKey: string
  showKey: boolean
  onKeyChange: (key: string) => void
  onToggleShow: () => void
  saving?: boolean
  saved?: boolean
  onSave?: () => void
  enabled?: boolean
  onToggleEnabled?: (enabled: boolean) => void
}

interface Props {
  entries: ProviderEntry[]
  models: Record<string, boolean>
  onToggleModel: (provider: ModelProvider, modelId: string, enabled: boolean) => void
}

export function ProviderAccordion({ entries, models, onToggleModel }: Props) {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {PROVIDERS.map((p) => {
        const entry = entries.find((e) => e.provider === p)!
        const meta = PROVIDER_META[p]
        const { Logo } = meta
        const hasKey = !!entry.apiKey.trim()
        const isDashboard = entry.onSave !== undefined

        return (
          <AccordionItem key={p} value={p} className="border rounded-lg px-4 overflow-hidden">
            <AccordionTrigger className="hover:no-underline py-4 [&>svg]:hidden">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground shrink-0">
                  <Logo className="h-6 w-6" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {meta.label}
                    {isDashboard
                      ? entry.saved && <span className="text-xs font-normal text-primary">Key saved ✓</span>
                      : hasKey && <span className="text-xs font-normal text-primary">✓ configured</span>
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{meta.description}</p>
                </div>
                {entry.onToggleEnabled && (
                  <button
                    type="button"
                    className={`shrink-0 p-1.5 rounded-md transition-colors ${
                      entry.enabled
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={entry.enabled ? "Disable provider" : "Enable provider"}
                    onClick={(e) => { e.stopPropagation(); entry.onToggleEnabled!(!entry.enabled) }}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-1.5">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={entry.showKey ? "text" : "password"}
                      placeholder={meta.placeholder}
                      value={entry.apiKey}
                      onChange={(e) => entry.onKeyChange(e.target.value)}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={entry.onToggleShow}
                    >
                      {entry.showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {entry.onSave && (
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!entry.apiKey.trim() || entry.saving}
                      onClick={entry.onSave}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Models</Label>
                {MODELS.filter((m) => m.provider === p).map((m) => {
                  const active = isDashboard ? (models[m.id] ?? true) : (hasKey && models[m.id])
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                        isDashboard || hasKey
                          ? "cursor-pointer hover:bg-muted"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                      onClick={() => (isDashboard || hasKey) && onToggleModel(p, m.id, !active)}
                    >
                      <span className="text-sm">{m.label}</span>
                      {!isDashboard && <span className="text-xs text-muted-foreground ml-2">{m.provider}</span>}
                      <ToggleSwitch active={!!active} />
                    </div>
                  )
                })}
                {!isDashboard && !hasKey && (
                  <p className="px-3 pt-1 text-xs text-muted-foreground">Add an API key to enable models</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
