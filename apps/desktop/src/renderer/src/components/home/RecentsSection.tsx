import { useEffect } from "react"
import { ipc } from "@/lib/ipc"
import { useHistoryStore } from "@/store/history-store"
import { HistoryCard } from "./HistoryCard"

export function RecentsSection() {
  const { items, setItems, removeItem } = useHistoryStore()

  useEffect(() => {
    ipc.history.list(50).then(setItems).catch(() => {})
    return ipc.onHistoryPrepend((entry) =>
      useHistoryStore.getState().prependItem(entry),
    )
  }, [setItems])

  const handleDelete = async (id: string) => {
    removeItem(id)
    try {
      await ipc.history.delete(id)
    } catch {}
  }

  return (
    <div className="px-4 pb-6 pt-6">
      <h2 className="px-1 pb-2 text-label-medium uppercase tracking-wide text-on-surface-variant/60">
        History
      </h2>
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
    </div>
  )
}
