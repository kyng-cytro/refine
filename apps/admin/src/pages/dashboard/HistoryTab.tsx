import { useEffect, useState } from "react"
import { api, type HistoryItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HistoryTab() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.history
      .list()
      .then((res) => {
        setItems(res.data)
        setCursor(res.nextCursor)
        setHasMore(res.hasMore)
      })
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false))
  }, [])

  const loadMore = async () => {
    if (!cursor) return
    setLoadingMore(true)
    try {
      const res = await api.history.list(cursor)
      setItems((prev) => [...prev, ...res.data])
      setCursor(res.nextCursor)
      setHasMore(res.hasMore)
    } catch {
      setError("Failed to load more.")
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (error) return <p className="text-destructive text-sm">{error}</p>
  if (items.length === 0) return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">No refinements yet.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{item.modelId} · {item.toneSlug}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {item.deviceName ?? <span className="italic">deleted device</span>} · {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3 items-start">
            <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{item.source}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
            <p className="text-sm flex-1 line-clamp-3">{item.refined}</p>
          </div>
        </div>
      ))}

      {hasMore && (
        <Button variant="outline" className="w-full" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading…" : "Load More"}
        </Button>
      )}
    </div>
  )
}
