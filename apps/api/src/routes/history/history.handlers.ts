import type { AppRouteHandler, AuthenticatedContext } from "@/lib/context"
import * as dal from "@/routes/history/history.dal"
import type { List, Remove } from "@/routes/history/history.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List, AuthenticatedContext> = async (c) => {
  try {
    const query = c.req.valid("query")
    const result = await dal.list(c.var.session.id, query)
    return c.json(result, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[HISTORY:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch history",
    })
  }
}

export const remove: AppRouteHandler<Remove, AuthenticatedContext> = async (
  c,
) => {
  try {
    const { id } = c.req.valid("param")
    const deleted = await dal.remove(c.var.session.id, id)
    if (!deleted) {
      return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    }
    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    c.var.logger.error(`[HISTORY:DELETE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to delete history item",
    })
  }
}
