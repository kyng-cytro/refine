import { db, orm, schema } from "@/lib/db"
import { env } from "bun"
import consola from "consola"

const DAY_MS = 86_400_000
const INTERVAL_MS = 12 * 60 * 60 * 1000

export const pruneHistory = async (days: number): Promise<number> => {
  const cutoff = new Date(Date.now() - days * DAY_MS)
  const deleted = await db
    .delete(schema.history)
    .where(orm.lt(schema.history.createdAt, cutoff))
    .returning({ id: schema.history.id })
  return deleted.length
}

export const startRetention = (): void => {
  const days = env.HISTORY_RETENTION_DAYS
  if (!days || days <= 0) return

  const run = () =>
    pruneHistory(days)
      .then((n) => {
        if (n > 0) consola.info(`[RETENTION] pruned ${n} history rows`)
      })
      .catch((e) => consola.error(`[RETENTION] ${e}`))

  consola.info(`Retention enabled: history older than ${days}d`)
  run()
  setInterval(run, INTERVAL_MS)
}
