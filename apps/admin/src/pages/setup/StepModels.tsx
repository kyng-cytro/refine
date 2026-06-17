import { useState } from "react"
import { api } from "@/lib/api"
import { PROVIDERS, getModels } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  onNext: () => void
}

export default function StepModels({ onNext }: Props) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(getModels().map((m) => [m.id, true])),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggle = (id: string) =>
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await Promise.all(
        getModels().map((m) =>
          api.providers.toggleModel(m.provider, m.id, enabled[m.id]),
        ),
      )
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save model preferences.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enable Models</CardTitle>
        <CardDescription>
          Choose which models are available to users. You can change this later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {PROVIDERS.map((provider) => (
            <div key={provider.id}>
              <p className="text-sm font-medium mb-3">{provider.label}</p>
              <div className="space-y-2">
                {provider.models.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-primary h-4 w-4"
                      checked={enabled[m.id]}
                      onChange={() => toggle(m.id)}
                    />
                    <span className="text-sm">{m.label}</span>
                    {m.free && (
                      <span className="text-xs font-medium text-emerald-600">Free</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
