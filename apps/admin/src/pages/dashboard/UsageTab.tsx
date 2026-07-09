import { useEffect, useState } from "react"
import { api, type UsageOverview } from "@/lib/api"

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 0 },
]

const nf = new Intl.NumberFormat()

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function BarList({
  title,
  rows,
}: {
  title: string
  rows: { key: string; value: number; hint?: string }[]
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No data.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate">{r.key}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {r.hint ?? nf.format(r.value)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DailyChart({ data }: { data: UsageOverview["byDay"] }) {
  const max = Math.max(1, ...data.map((d) => d.refines))
  const gap = 2
  const bw = data.length > 0 ? 100 / data.length : 0
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium">Refines per day</h3>
      {data.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No data.</p>
      ) : (
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="mt-3 h-28 w-full"
        >
          {data.map((d, i) => {
            const h = (d.refines / max) * 38
            return (
              <rect
                key={d.day}
                x={i * bw + gap / 2}
                y={40 - h}
                width={Math.max(0.5, bw - gap)}
                height={h}
                rx={0.5}
                className="fill-primary"
              >
                <title>{`${d.day}: ${d.refines} refines`}</title>
              </rect>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export default function UsageTab() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<UsageOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    api.usage
      .get(days)
      .then(setData)
      .catch(() => setError("Failed to load usage."))
      .finally(() => setLoading(false))
  }, [days])

  if (error) return <p className="text-destructive text-sm">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setDays(r.days)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              days === r.days
                ? "bg-secondary text-secondary-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Refines" value={nf.format(data.totals.refines)} />
            <StatCard label="Tokens" value={nf.format(data.totals.tokens)} />
            <StatCard
              label="Est. cost"
              value={
                data.estimatedCost > 0
                  ? `$${data.estimatedCost.toFixed(2)}`
                  : "—"
              }
            />
          </div>

          <DailyChart data={data.byDay} />

          <div className="grid gap-3 md:grid-cols-2">
            <BarList
              title="By model"
              rows={data.byModel.map((m) => ({
                key: m.key,
                value: m.refines,
                hint: `${nf.format(m.refines)} · ${nf.format(m.tokens)} tok`,
              }))}
            />
            <BarList
              title="By tone"
              rows={data.byTone.map((t) => ({ key: t.key, value: t.refines }))}
            />
          </div>

          <BarList
            title="By device"
            rows={data.byDevice.map((d) => ({ key: d.key, value: d.refines }))}
          />
        </>
      )}
    </div>
  )
}
