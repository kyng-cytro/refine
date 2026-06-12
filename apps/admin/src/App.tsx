import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { clearPendingToken, commitPendingToken, getToken } from "@/lib/storage"
import Dashboard from "@/pages/dashboard/Dashboard"
import LoginScreen from "@/pages/LoginScreen"
import SetupWizard from "@/pages/setup/SetupWizard"

type State = "loading" | "login" | "setup" | "dashboard"

export default function App() {
  const [state, setState] = useState<State>("loading")

  useEffect(() => {
    clearPendingToken()
    const token = getToken()

    api.setup.status().then(({ configured }) => {
      if (!token) {
        setState(configured ? "login" : "setup")
        return
      }
      api.tokens
        .list()
        .then(() => setState(configured ? "dashboard" : "setup"))
        .catch(() => setState(configured ? "login" : "setup"))
    }).catch(() => setState("login"))
  }, [])

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    )
  }

  if (state === "login") {
    return (
      <LoginScreen
        onLogin={() =>
          api.setup.status()
            .then(({ configured }) => setState(configured ? "dashboard" : "setup"))
            .catch(() => setState("dashboard"))
        }
      />
    )
  }

  if (state === "setup") {
    return (
      <SetupWizard
        onComplete={() => {
          commitPendingToken()
          setState("dashboard")
        }}
      />
    )
  }

  return <Dashboard onSignOut={() => setState("login")} />
}
