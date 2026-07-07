import { useState } from "react"
import type { HistoryItem } from "@refine/schemas"
import { Check, Copy, Trash2 } from "lucide-react"

function relativeTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface Props {
  item: HistoryItem
  onDelete: (id: string) => void
}

export function HistoryCard({ item, onDelete }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(item.refined)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative rounded-m3-md bg-surface-container-low px-4 py-3 transition-colors hover:bg-surface-container">
      <button
        type="button"
        onClick={copy}
        title="Copy refined text"
        className="block w-full text-left"
      >
        <p className="line-clamp-3 text-body-medium text-on-surface">
          {item.refined}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="flex-1 truncate text-body-small text-on-surface-variant/70">
            {item.source}
          </span>
          <span className="shrink-0 text-label-medium text-on-surface-variant/60">
            {relativeTime(item.createdAt)}
          </span>
        </div>
      </button>
      <div className="absolute right-2 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={copy}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary"
          aria-label="Copy"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-error"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
