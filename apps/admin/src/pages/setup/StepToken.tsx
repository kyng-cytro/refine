import { useState } from "react"
import { api, type Token } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy } from "lucide-react"

interface Props {
  onNext: () => void
}

export default function StepToken({ onNext }: Props) {
  const [label, setLabel] = useState("My Phone")
  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    setLoading(true)
    setError("")
    try {
      const t = await api.tokens.create(label.trim())
      setToken(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token.")
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!token) return
    navigator.clipboard.writeText(token.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Link Your Device</h1>
        <p className="text-muted-foreground mt-1.5">
          Generate a one-time pairing token and enter it in the Refine app.
        </p>
      </div>

      <div className="space-y-4">
        {!token ? (
          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="label">Device Label</Label>
              <Input
                id="label"
                placeholder="My Phone"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={!label.trim() || loading}>
              {loading ? "Generating…" : "Generate Token"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Open the Refine app and go to <strong>Settings → Connect to Server</strong>. This token can only be used once.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4 flex items-center gap-3">
              <code className="text-sm font-mono flex-1 break-all">{token.token}</code>
              <Button variant="ghost" size="icon" onClick={copy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button className="w-full" onClick={onNext}>
              Continue
            </Button>
          </div>
        )}

        {!token && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onNext}>
            Skip for now
          </Button>
        )}
      </div>
    </div>
  )
}
