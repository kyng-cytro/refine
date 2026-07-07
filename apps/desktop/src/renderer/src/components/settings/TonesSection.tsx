import { useState } from "react"
import type { Tone } from "@refine/schemas"
import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/m3/Button"
import { Surface } from "@/components/m3/Surface"
import { ipc } from "@/lib/ipc"
import { useSettingsStore } from "@/store/settings-store"
import { Section } from "./Section"
import { ToneDialog } from "./ToneDialog"

export function TonesSection() {
  const { tones, toneSlug, update } = useSettingsStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Tone | null>(null)

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (tone: Tone) => {
    if (tone.isGlobal) return
    setEditing(tone)
    setDialogOpen(true)
  }

  const handleDelete = async (tone: Tone) => {
    if (toneSlug === tone.slug) {
      const fallback = tones.find((t) => t.id !== tone.id)
      if (fallback) update({ toneSlug: fallback.slug })
    }
    try {
      await ipc.tones.delete(tone.id)
    } catch {}
  }

  return (
    <Section title="Tones">
      <Surface level={1} className="divide-y divide-outline-variant rounded-m3-md">
        {tones.map((tone) => {
          const isDefault = tone.slug === toneSlug
          return (
            <div key={tone.id} className="flex items-center gap-3 p-3 pl-4">
              <button
                type="button"
                onClick={() => update({ toneSlug: tone.slug })}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {isDefault && <Check className="h-4 w-4 text-primary" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-body-large text-on-surface">
                    {tone.name}
                  </span>
                  {tone.isGlobal && (
                    <span className="text-body-small text-on-surface-variant">
                      Global
                    </span>
                  )}
                </span>
              </button>
              {!tone.isGlobal && (
                <>
                  <button
                    type="button"
                    onClick={() => openEdit(tone)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tone)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:text-error"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )
        })}
      </Surface>
      <Button variant="text" onClick={openNew} className="mt-2">
        <Plus className="h-4 w-4" />
        Add tone
      </Button>

      <ToneDialog
        open={dialogOpen}
        tone={editing}
        onOpenChange={setDialogOpen}
        onSaved={() => ipc.session.bootstrap()}
      />
    </Section>
  )
}
