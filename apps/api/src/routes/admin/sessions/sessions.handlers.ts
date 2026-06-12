import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/sessions/sessions.dal"
import type { List, Remove } from "@/routes/admin/sessions/sessions.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

const mapSession = (row: any) => ({
  id: row.id,
  deviceName: row.deviceName,
  createdAt: row.createdAt.getTime(),
  pairingTokenLabel: row.pairingToken.label,
})

export const list: AppRouteHandler<List> = async (c) => {
  try {
    const sessions = await dal.getAll()
    return c.json(sessions.map(mapSession), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch sessions",
    })
  }
}

export const remove: AppRouteHandler<Remove> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    const deleted = await dal.remove(id)
    if (!deleted) {
      return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    }
    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:DELETE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to revoke session",
    })
  }
}
