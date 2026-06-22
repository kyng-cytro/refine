import { useState } from "react"
import { clearToken } from "@/lib/storage"
import Logo from "@/components/Logo"
import DevicesTab from "@/pages/dashboard/DevicesTab"
import HistoryTab from "@/pages/dashboard/HistoryTab"
import ProvidersTab from "@/pages/dashboard/ProvidersTab"
import TonesTab from "@/pages/dashboard/TonesTab"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  History,
  KeyRound,
  LogOut,
  Menu,
  MessageSquareQuote,
  Smartphone,
} from "lucide-react"

type Page = "devices" | "tones" | "history" | "providers"

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "devices", label: "Devices", icon: <Smartphone className="h-4 w-4" /> },
  {
    id: "tones",
    label: "Tones",
    icon: <MessageSquareQuote className="h-4 w-4" />,
  },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  {
    id: "providers",
    label: "Providers",
    icon: <KeyRound className="h-4 w-4" />,
  },
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const signOut = () => {
    clearToken()
    onSignOut()
  }

  const navigate = (id: Page) => {
    setPage(id)
    setSidebarOpen(false)
  }

  const { title, description } = PAGE_META[page]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 shrink-0 flex-col border-r bg-sidebar transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
              onClick={() => navigate(id)}
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

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden item">
        <header className="border-b px-6 py-5 shrink-0 flex items-center gap-4">
          <button
            className="md:hidden mt-0.5 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
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
