import { useEffect, useState } from "react"
import { api, type ProviderState } from "@/lib/api"
import { MODELS, PROVIDERS, type ModelProvider } from "@/lib/models"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Power, Save } from "lucide-react"

const PROVIDER_META: Record<
  ModelProvider,
  { label: string; description: string; placeholder: string; logo: React.ReactNode }
> = {
  openai: {
    label: "OpenAI",
    description: "GPT-4o and GPT-4o mini",
    placeholder: "sk-…",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z" />
      </svg>
    ),
  },
  anthropic: {
    label: "Anthropic",
    description: "Claude 3.5 Sonnet and Claude Haiku 3.5",
    placeholder: "sk-ant-…",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M17.304 3.541h-3.672l6.696 16.918H24Zm-10.608 0L0 20.459h3.744l1.37-3.553h7.005l1.369 3.553h3.744L10.536 3.541Zm-.371 10.223L8.616 7.82l2.291 5.945Z" />
      </svg>
    ),
  },
  google: {
    label: "Google",
    description: "Gemini 2.0 Flash and Gemini 2.0 Flash Lite",
    placeholder: "AIza…",
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133c-1.147 1.147-2.933 2.4-6.053 2.4c-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0C5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36c2.16-2.16 2.84-5.213 2.84-7.667c0-.76-.053-1.467-.173-2.053z" />
      </svg>
    ),
  },
}

interface FormState {
  apiKey: string
  showKey: boolean
  saving: boolean
  saved: boolean
  enabled: boolean
}

const defaultForms = () =>
  Object.fromEntries(
    PROVIDERS.map((p) => [p, { apiKey: "", showKey: false, saving: false, saved: false, enabled: true }]),
  ) as Record<ModelProvider, FormState>

export default function ProvidersTab() {
  const [forms, setForms] = useState<Record<ModelProvider, FormState>>(defaultForms)
  const [models, setModels] = useState<Record<string, boolean>>(
    Object.fromEntries(MODELS.map((m) => [m.id, true])),
  )
  const [error, setError] = useState("")

  useEffect(() => {
    api.providers.list().then((providerStates: ProviderState[]) => {
      const modelMap: Record<string, boolean> = {}
      const enabledMap: Partial<Record<ModelProvider, boolean>> = {}
      providerStates.forEach((p) => {
        enabledMap[p.provider as ModelProvider] = p.enabled
        p.models.forEach((m) => { modelMap[m.id] = m.enabled })
      })
      setForms((prev) =>
        Object.fromEntries(
          PROVIDERS.map((p) => [p, { ...prev[p], enabled: enabledMap[p] ?? true }]),
        ) as Record<ModelProvider, FormState>,
      )
      setModels((prev) => ({ ...prev, ...modelMap }))
    }).catch(() => {})
  }, [])

  const save = async (p: ModelProvider) => {
    const key = forms[p].apiKey.trim()
    if (!key) return
    setForms((prev) => ({ ...prev, [p]: { ...prev[p], saving: true, saved: false } }))
    setError("")
    try {
      await api.providers.upsert(p, key, forms[p].enabled)
      setForms((prev) => ({ ...prev, [p]: { ...prev[p], saving: false, saved: true, apiKey: "" } }))
      setTimeout(() => setForms((prev) => ({ ...prev, [p]: { ...prev[p], saved: false } })), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
      setForms((prev) => ({ ...prev, [p]: { ...prev[p], saving: false } }))
    }
  }

  const toggle = async (p: ModelProvider, enabled: boolean) => {
    setForms((prev) => ({ ...prev, [p]: { ...prev[p], enabled } }))
    try {
      await api.providers.upsert(p, undefined, enabled)
    } catch {
      setForms((prev) => ({ ...prev, [p]: { ...prev[p], enabled: !enabled } }))
    }
  }

  const toggleModel = async (provider: ModelProvider, modelId: string, enabled: boolean) => {
    setModels((prev) => ({ ...prev, [modelId]: enabled }))
    try {
      await api.providers.toggleModel(provider, modelId, enabled)
    } catch {
      setModels((prev) => ({ ...prev, [modelId]: !enabled }))
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Accordion type="single" collapsible className="space-y-2">
        {PROVIDERS.map((p) => {
          const meta = PROVIDER_META[p]
          const form = forms[p]
          return (
            <AccordionItem key={p} value={p} className="border rounded-lg px-4 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4 [&>svg]:hidden">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground shrink-0">
                    {meta.logo}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      {meta.label}
                      {form.saved && <span className="text-xs font-normal text-primary">Key saved ✓</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{meta.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`shrink-0 p-1.5 rounded-md transition-colors ${
                      form.enabled
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={form.enabled ? "Disable provider" : "Enable provider"}
                    onClick={(e) => { e.stopPropagation(); toggle(p, !form.enabled) }}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={form.showKey ? "text" : "password"}
                        placeholder={meta.placeholder}
                        value={form.apiKey}
                        onChange={(e) =>
                          setForms((prev) => ({ ...prev, [p]: { ...prev[p], apiKey: e.target.value } }))
                        }
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() =>
                          setForms((prev) => ({ ...prev, [p]: { ...prev[p], showKey: !prev[p].showKey } }))
                        }
                      >
                        {form.showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!form.apiKey.trim() || form.saving}
                      onClick={() => save(p)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Models</Label>
                  {MODELS.filter((m) => m.provider === p).map((m) => {
                    const active = models[m.id] ?? true
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-md px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => toggleModel(p, m.id, !active)}
                      >
                        <span className="text-sm">{m.label}</span>
                        <div className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-primary" : "bg-input"}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
