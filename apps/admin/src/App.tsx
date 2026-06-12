import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getToken } from "@/lib/storage"
import Dashboard from "@/pages/dashboard/Dashboard"
import SetupWizard from "@/pages/setup/SetupWizard"

type State = "loading" | "setup" | "dashboard"

export default function App() {
  const [state, setState] = useState<State>("loading")

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setState("setup")
      return
    }
    api.tokens
      .list()
      .then(() => setState("dashboard"))
      .catch(() => setState("setup"))
  }, [])

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    )
  }

  if (state === "setup") {
    return <SetupWizard onComplete={() => setState("dashboard")} />
  }

  return <Dashboard onSignOut={() => setState("setup")} />
}
