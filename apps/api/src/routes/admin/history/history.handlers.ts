import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/history/history.dal"
import type { List } from "@/routes/admin/history/history.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List> = async (c) => {
  try {
    const query = c.req.valid("query")
    const result = await dal.list(query)
    return c.json(result, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:HISTORY:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch history",
    })
  }
}
