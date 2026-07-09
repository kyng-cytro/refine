import type { AppRouteHandler } from "@/lib/context"
import { pruneHistory } from "@/lib/retention"
import * as dal from "@/routes/admin/history/history.dal"
import type {
  List,
  Prune,
  Remove,
  RemoveAll,
} from "@/routes/admin/history/history.routes"
import { env } from "bun"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List> = async (c) => {
  try {
    const query = c.req.valid("query")
    return c.json(await dal.list(query), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:HISTORY:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch history",
    })
  }
}

export const remove: AppRouteHandler<Remove> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    const deleted = await dal.remove(id)
    if (!deleted) return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    c.var.logger.error(`[ADMIN:HISTORY:DELETE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to delete history item",
    })
  }
}

export const removeAll: AppRouteHandler<RemoveAll> = async (c) => {
  try {
    await dal.removeAll()
    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    c.var.logger.error(`[ADMIN:HISTORY:DELETE_ALL] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to delete history",
    })
  }
}

export const prune: AppRouteHandler<Prune> = async (c) => {
  try {
    const { days } = c.req.valid("query")
    const retentionDays = days ?? env.HISTORY_RETENTION_DAYS
    if (!retentionDays || retentionDays <= 0) {
      return c.json({ pruned: 0 }, HttpStatusCodes.OK)
    }
    const pruned = await pruneHistory(retentionDays)
    return c.json({ pruned }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:HISTORY:PRUNE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to prune history",
    })
  }
}
