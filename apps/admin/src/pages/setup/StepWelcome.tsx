import { useState } from "react"
import { api } from "@/lib/api"
import { setPendingToken } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onNext: () => void
}

export default function StepWelcome({ onNext }: Props) {
  const [token, setTokenValue] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError("")
    setPendingToken(token.trim())
    try {
      await api.tokens.list()
      onNext()
    } catch {
      setPendingToken("")
      setError("Invalid admin token — check your ADMIN_TOKEN environment variable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Refine</h1>
        <p className="text-muted-foreground mt-1.5">
          Let's get your server set up. Enter your admin token to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="token">Admin Token</Label>
          <Input
            id="token"
            type="password"
            placeholder="Enter your ADMIN_TOKEN"
            value={token}
            onChange={(e) => setTokenValue(e.target.value)}
            autoFocus
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground">
            This is the{" "}
            <code className="bg-muted rounded px-1 py-0.5">ADMIN_TOKEN</code>{" "}
            value from your server environment.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={!token.trim() || loading}>
          {loading ? "Verifying…" : "Continue"}
        </Button>
      </form>
    </div>
  )
}
