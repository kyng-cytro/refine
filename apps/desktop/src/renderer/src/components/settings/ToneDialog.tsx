import { useEffect, useState } from "react"
import type { Tone } from "@refine/schemas"
import { Button } from "@/components/m3/Button"
import { Dialog } from "@/components/m3/Dialog"
import { Spinner } from "@/components/m3/Spinner"
import { OutlinedTextArea, TextField } from "@/components/m3/TextField"
import { ipc } from "@/lib/ipc"

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

interface Props {
  open: boolean
  tone: Tone | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ToneDialog({ open, tone, onOpenChange, onSaved }: Props) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [instructions, setInstructions] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setName(tone?.name ?? "")
      setSlug(tone?.slug ?? "")
      setSlugTouched(!!tone)
      setInstructions(tone?.instructions ?? "")
      setError("")
    }
  }, [open, tone])

  const save = async () => {
    setError("")
    setSaving(true)
    try {
      const body = { name: name.trim(), slug: slug.trim(), instructions: instructions.trim() }
      if (tone) await ipc.tones.update(tone.id, body)
      else await ipc.tones.create(body)
      onOpenChange(false)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save tone")
    } finally {
      setSaving(false)
    }
  }

  const valid = name.trim() && slug.trim() && instructions.trim()

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !saving && onOpenChange(o)}
      title={tone ? "Edit tone" : "New tone"}
      actions={
        <>
          <Button variant="text" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !valid}>
            {saving && <Spinner size={16} className="text-on-primary" />}
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (!slugTouched) setSlug(slugify(e.target.value))
          }}
        />
        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(e.target.value)
          }}
        />
        <OutlinedTextArea
          label="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          error={error || undefined}
        />
      </div>
    </Dialog>
  )
}
