import { useState } from "react"
import { clearToken } from "@/lib/storage"
import Logo from "@/components/Logo"
import DevicesTab from "@/pages/dashboard/DevicesTab"
import HistoryTab from "@/pages/dashboard/HistoryTab"
import ProvidersTab from "@/pages/dashboard/ProvidersTab"
import TonesTab from "@/pages/dashboard/TonesTab"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { History, KeyRound, LogOut, MessageSquareQuote, Smartphone } from "lucide-react"

type Page = "devices" | "tones" | "history" | "providers"

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "devices", label: "Devices", icon: <Smartphone className="h-4 w-4" /> },
  { id: "tones", label: "Tones", icon: <MessageSquareQuote className="h-4 w-4" /> },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  { id: "providers", label: "Providers", icon: <KeyRound className="h-4 w-4" /> },
]

const PAGE_META: Record<Page, { title: string; description: string }> = {
  devices: {
    title: "Devices",
    description: "Manage connected devices and generate pairing tokens.",
  },
  tones: {
    title: "Tones",
    description: "Global tones available to all users.",
  },
  history: {
    title: "History",
    description: "Refinement history across all connected devices.",
  },
  providers: {
    title: "Providers",
    description: "Configure AI provider API keys and enable models.",
  },
}

interface Props {
  onSignOut: () => void
}

export default function Dashboard({ onSignOut }: Props) {
  const [page, setPage] = useState<Page>("devices")

  const signOut = () => {
    clearToken()
    onSignOut()
  }

  const { title, description } = PAGE_META[page]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold">Refine Admin</span>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                page === id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        <Separator />

        <div className="px-3 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="border-b px-8 py-5 shrink-0">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl">
            {page === "devices" && <DevicesTab />}
            {page === "tones" && <TonesTab />}
            {page === "history" && <HistoryTab />}
            {page === "providers" && <ProvidersTab />}
          </div>
        </main>
      </div>
    </div>
  )
}
