import { useState } from "react"
import { api } from "@/lib/api"
import { setToken } from "@/lib/storage"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    setError("")
    setToken(value.trim())
    try {
      await api.tokens.list()
      onLogin()
    } catch {
      setToken("")
      setError("Invalid admin token.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-semibold">Refine Admin</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Enter your admin token to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="token">Admin Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="Enter your ADMIN_TOKEN"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={!value.trim() || loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
