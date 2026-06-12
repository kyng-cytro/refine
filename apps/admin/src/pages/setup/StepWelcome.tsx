import { useState } from "react"
import { api } from "@/lib/api"
import { setToken } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    setToken(token.trim())
    try {
      await api.tokens.list()
      onNext()
    } catch {
      setToken("")
      setError("Invalid admin token — check your ADMIN_TOKEN env variable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Refine</CardTitle>
        <CardDescription>
          Enter your admin token to get started. This is the{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">
            ADMIN_TOKEN
          </code>{" "}
          value from your environment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Admin Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="Enter your admin token"
              value={token}
              onChange={(e) => setTokenValue(e.target.value)}
              autoFocus
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={!token.trim() || loading}>
            {loading ? "Verifying…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
