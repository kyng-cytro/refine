import { useEffect, useState } from "react"
import { RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/m3/Button"
import { Dialog } from "@/components/m3/Dialog"
import { IconButton } from "@/components/m3/IconButton"
import { cn } from "@/lib/utils"
import { ipc } from "@/lib/ipc"
import { useHistoryStore } from "@/store/history-store"
import { HistoryCard } from "./HistoryCard"

export function RecentsSection() {
  const { items, setItems, removeItem } = useHistoryStore()
  const [refreshing, setRefreshing] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    ipc.history.list(50).then(setItems).catch(() => {})
    return ipc.onHistoryPrepend((entry) =>
      useHistoryStore.getState().prependItem(entry),
    )
  }, [setItems])

  const handleDelete = async (id: string) => {
    const previous = items
    removeItem(id)
    try {
      await ipc.history.delete(id)
    } catch {
      setItems(previous)
    }
  }

  const refresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await Promise.all([
        ipc.session.bootstrap().catch(() => {}),
        ipc.history.list(50).then(setItems).catch(() => {}),
      ])
    } finally {
      setRefreshing(false)
    }
  }

  const clear = async () => {
    const previous = items
    setConfirmClear(false)
    setItems([])
    try {
      await ipc.history.clear()
    } catch {
      setItems(previous)
    }
  }

  return (
    <div className="px-4 pb-6 pt-6">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-label-medium uppercase tracking-wide text-on-surface-variant/60">
          History
        </h2>
        <div className="flex gap-1">
          <IconButton
            onClick={() => setConfirmClear(true)}
            disabled={items.length === 0}
            aria-label="Clear history"
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
          <IconButton
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refresh"
            className="h-8 w-8"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </IconButton>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="px-1 text-body-medium text-on-surface-variant/40">
          No refinements yet
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
      <Dialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear history?"
        description="This deletes all refinements saved from this device."
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button onClick={clear}>Clear</Button>
          </>
        }
      />
    </div>
  )
}
