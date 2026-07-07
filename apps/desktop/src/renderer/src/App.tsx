import { useEffect, useState } from "react"
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { AppShell } from "@/components/AppShell"
import { PairConfirmDialog } from "@/components/PairConfirmDialog"
import { ipc } from "@/lib/ipc"
import HomeScreen from "@/screens/HomeScreen"
import KitchenSink from "@/screens/KitchenSink"
import OverlayScreen from "@/screens/OverlayScreen"
import SettingsScreen from "@/screens/SettingsScreen"
import SetupScreen from "@/screens/SetupScreen"
import { useSettingsStore } from "@/store/settings-store"
import type { PairIncoming } from "../../shared/types"

function ConnectedGuard({ children }: { children: React.ReactNode }) {
  const connected = useSettingsStore((s) => s.connected)
  if (!connected) return <Navigate to="/setup" replace />
  return <>{children}</>
}

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const connected = useSettingsStore((s) => s.connected)
  const [pairParams, setPairParams] = useState<PairIncoming | null>(null)

  useEffect(() => {
    const unsubscribe = ipc.onPairIncoming(setPairParams)
    ipc.session.consumePendingPair().then((pair) => {
      if (pair) setPairParams(pair)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (connected) ipc.session.bootstrap().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!connected && location.pathname !== "/setup") {
      navigate("/setup", { replace: true })
    }
  }, [connected, location.pathname, navigate])

  return (
    <>
      <Routes>
        <Route
          element={
            <ConnectedGuard>
              <AppShell />
            </ConnectedGuard>
          }
        >
          <Route path="/" element={<HomeScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Route>
        <Route path="/setup" element={<SetupScreen />} />
        <Route path="/overlay" element={<OverlayScreen />} />
        <Route path="/kitchen-sink" element={<KitchenSink />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PairConfirmDialog
        params={pairParams}
        onDismiss={() => setPairParams(null)}
        onPaired={() => navigate("/", { replace: true })}
      />
    </>
  )
}

export default function App() {
  const { hydrated, hydrate } = useSettingsStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) return null

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
