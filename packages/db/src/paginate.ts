import type { AnyColumn, SQL } from "drizzle-orm"

export type PaginationQuery = {
  cursor?: string | null
  limit: number
}

type OrderDirection = "asc" | "desc"

export const options = (
  query: PaginationQuery,
  config: {
    where?: SQL
    order: SQL[]
    column: AnyColumn
    direction?: OrderDirection
  },
) => {
  const { limit, cursor = null } = query
  const direction = config.direction ?? "asc"
  return {
    where: (_table: any, operators: any) => {
      const base = config.where
      if (!cursor) return base
      const { column } = config
      const condition =
        direction === "desc"
          ? operators.lt(column, cursor)
          : operators.gt(column, cursor)
      if (!base) return condition
      return operators.and(base, condition)
    },
    limit: limit + 1,
    orderBy: config.order,
  }
}

export const format = <TRow, TCursor, TOut = TRow>(
  rows: TRow[],
  config: {
    limit: number
    map?: (row: TRow) => TOut
    getCursor: (row: TRow) => TCursor
  },
) => {
  const { limit } = config
  const hasMore = rows.length > limit
  const sliced = hasMore ? rows.slice(0, limit) : rows
  const data = config.map
    ? sliced.map(config.map)
    : (sliced as unknown as TOut[])
  const lastRow = sliced[sliced.length - 1]
  const nextCursor = hasMore && lastRow ? config.getCursor(lastRow) : null
  return {
    data,
    hasMore,
    nextCursor,
  }
}
