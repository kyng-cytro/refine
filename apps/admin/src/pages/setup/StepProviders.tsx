import { useState } from "react"
import { api } from "@/lib/api"
import { PROVIDER_LABELS, PROVIDERS, type ModelProvider } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onNext: () => void
}

export default function StepProviders({ onNext }: Props) {
  const [keys, setKeys] = useState<Record<ModelProvider, string>>({
    openai: "",
    anthropic: "",
    google: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const configured = PROVIDERS.filter((p) => keys[p].trim())
    if (configured.length === 0) {
      setError("Add at least one API key to continue.")
      return
    }
    setLoading(true)
    setError("")
    try {
      await Promise.all(
        configured.map((p) => api.providers.upsert(p, keys[p].trim(), true)),
      )
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save providers.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Providers</CardTitle>
        <CardDescription>
          Add API keys for the AI providers you want to use. You can skip any
          providers you don't need.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {PROVIDERS.map((p) => (
            <div key={p} className="space-y-2">
              <Label htmlFor={p}>{PROVIDER_LABELS[p]} API Key</Label>
              <Input
                id={p}
                type="password"
                placeholder={`sk-…`}
                value={keys[p]}
                onChange={(e) =>
                  setKeys((prev) => ({ ...prev, [p]: e.target.value }))
                }
              />
            </div>
          ))}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving…" : "Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
