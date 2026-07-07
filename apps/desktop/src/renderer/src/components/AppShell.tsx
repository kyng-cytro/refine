import { NavLink, Outlet } from "react-router-dom"
import { Home, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function AppShell() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between px-6 pb-2 pt-5">
        <h1 className="text-title-large">Refine</h1>
        <nav className="flex gap-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-2 rounded-full px-4 text-label-large transition-colors",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-on-surface/8",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
