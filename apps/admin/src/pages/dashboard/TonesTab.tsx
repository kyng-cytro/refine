import { useEffect, useState } from "react"
import { api, type Tone } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"

export default function TonesTab() {
  const [tones, setTones] = useState<Tone[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    instructions: "",
  })
  const [newForm, setNewForm] = useState({
    name: "",
    slug: "",
    instructions: "",
  })
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.tones
      .list()
      .then(setTones)
      .catch(() => setError("Failed to load tones."))
      .finally(() => setLoading(false))
  }, [])

  const startEdit = (tone: Tone) => {
    setEditingId(tone.id)
    setEditForm({
      name: tone.name,
      slug: tone.slug,
      instructions: tone.instructions,
    })
  }

  const saveEdit = async (id: string) => {
    try {
      const updated = await api.tones.update(id, editForm)
      setTones((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tone.")
    }
  }

  const remove = async (id: string) => {
    try {
      await api.tones.remove(id)
      setTones((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError("Failed to delete tone.")
    }
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.slug || !newForm.instructions) return
    try {
      const tone = await api.tones.create(newForm)
      setTones((prev) => [...prev, tone])
      setNewForm({ name: "", slug: "", instructions: "" })
      setShowNew(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tone.")
    }
  }

  const toSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  return (
    <div className="space-y-3">
      {error && <p className="text-destructive text-sm">{error}</p>}

      {tones.map((tone) => (
        <Card key={tone.id} className="overflow-hidden py-2">
          {editingId === tone.id ? (
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    value={editForm.slug}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, slug: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Instructions</Label>
                <Textarea
                  rows={3}
                  value={editForm.instructions}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, instructions: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-4 w-4 mr-1.5" /> Cancel
                </Button>
                <Button size="sm" onClick={() => saveEdit(tone.id)}>
                  <Check className="h-4 w-4 mr-1.5" /> Save
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex items-start justify-between gap-4 py-2 px-4">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium">{tone.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {tone.instructions}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => startEdit(tone)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(tone.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      <Separator />

      {showNew ? (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={create} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    placeholder="Formal"
                    value={newForm.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setNewForm((f) => ({
                        ...f,
                        name,
                        slug: f.slug || toSlug(name),
                      }))
                    }}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    placeholder="formal"
                    value={newForm.slug}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, slug: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Instructions</Label>
                <Textarea
                  rows={3}
                  placeholder="Rewrite the text in a formal, professional tone…"
                  value={newForm.instructions}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, instructions: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNew(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !newForm.name || !newForm.slug || !newForm.instructions
                  }
                >
                  Add Tone
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowNew(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tone
        </Button>
      )}
    </div>
  )
}
