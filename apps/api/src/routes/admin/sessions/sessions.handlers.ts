import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/sessions/sessions.dal"
import type { List, Remove, SetExpiry } from "@/routes/admin/sessions/sessions.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List> = async (c) => {
  try {
    return c.json(await dal.getAll(), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch sessions",
    })
  }
}

export const expiry: AppRouteHandler<SetExpiry> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    const { expiresAt } = c.req.valid("json")
    const updated = await dal.setExpiry(id, expiresAt !== null ? new Date(expiresAt) : null)
    if (!updated) return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    return c.json({
      id: updated.id,
      deviceName: updated.deviceName,
      createdAt: updated.createdAt.getTime(),
      expiresAt: updated.expiresAt?.getTime() ?? null,
      pairingTokenLabel: "",
    }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:EXPIRY] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to update session expiry",
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
    c.var.logger.error(`[ADMIN:SESSIONS:DELETE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to revoke session",
    })
  }
}
