import { useState } from "react"
import { api, type Token } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle>Link Your Device</CardTitle>
        <CardDescription>
          Generate a one-time pairing token and enter it in the Refine app to
          link your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!token ? (
          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-2">
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
              Enter this token in the Refine app under{" "}
              <strong>Settings → Connect to Server</strong>. It can only be used
              once.
            </p>
            <div className="bg-muted rounded-lg p-4 flex items-center justify-between gap-2">
              <code className="text-sm font-mono break-all">{token.token}</code>
              <Button variant="ghost" size="icon" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
        <Button
          variant={token ? "default" : "ghost"}
          className="w-full"
          onClick={onNext}
        >
          {token ? "Continue" : "Skip for now"}
        </Button>
      </CardContent>
    </Card>
  )
}
