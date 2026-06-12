import { clearToken } from "@/lib/storage"
import DevicesTab from "@/pages/dashboard/DevicesTab"
import HistoryTab from "@/pages/dashboard/HistoryTab"
import ProvidersTab from "@/pages/dashboard/ProvidersTab"
import TonesTab from "@/pages/dashboard/TonesTab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from "lucide-react"

interface Props {
  onSignOut: () => void
}

export default function Dashboard({ onSignOut }: Props) {
  const signOut = () => {
    clearToken()
    onSignOut()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Refine Admin</h1>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </header>

      <main className="px-6 py-6 max-w-5xl mx-auto">
        <Tabs defaultValue="providers">
          <TabsList className="mb-6">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="tones">Tones</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="providers">
            <ProvidersTab />
          </TabsContent>
          <TabsContent value="devices">
            <DevicesTab />
          </TabsContent>
          <TabsContent value="tones">
            <TonesTab />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
