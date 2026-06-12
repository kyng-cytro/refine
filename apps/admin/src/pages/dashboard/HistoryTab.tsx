import { useEffect, useState } from "react"
import { api, type HistoryItem } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No history yet.</p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {item.modelId}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {item.toneSlug}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {item.deviceName} · {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Original
              </p>
              <p className="text-sm line-clamp-4">{item.source}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Refined
              </p>
              <p className="text-sm line-clamp-4">{item.refined}</p>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading…" : "Load More"}
        </Button>
      )}
    </div>
  )
}
