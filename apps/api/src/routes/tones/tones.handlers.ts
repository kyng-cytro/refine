import type { AppRouteHandler, AuthenticatedContext } from "@/lib/context"
import type { Create, List, Remove, Update } from "@/routes/tones/tones.routes"
import * as dal from "@/routes/tones/tones.dal"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List, AuthenticatedContext> = async (c) => {
  try {
    const tones = await dal.list(c.var.session.id)
    return c.json(tones, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[TONES:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch tones",
    })
  }
}

export const create: AppRouteHandler<Create, AuthenticatedContext> = async (
  c,
) => {
  try {
    const data = c.req.valid("json")
    const tone = await dal.create(c.var.session.id, data)
    if (!tone) throw new Error("Insert returned no row")
    return c.json(tone, HttpStatusCodes.CREATED)
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE")) {
      return c.json(
        { message: "A tone with that slug already exists" },
        HttpStatusCodes.CONFLICT,
      )
    }
    c.var.logger.error(`[TONES:CREATE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to create tone",
    })
  }
}

export const update: AppRouteHandler<Update, AuthenticatedContext> = async (
  c,
) => {
  try {
    const { id } = c.req.valid("param")
    const data = c.req.valid("json")
    const tone = await dal.update(c.var.session.id, id, data)
    if (!tone)
      return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    return c.json(tone, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[TONES:UPDATE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to update tone",
    })
  }
}

export const remove: AppRouteHandler<Remove, AuthenticatedContext> = async (
  c,
) => {
  try {
    const { id } = c.req.valid("param")
    const deleted = await dal.remove(c.var.session.id, id)
    if (!deleted)
      return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    c.var.logger.error(`[TONES:DELETE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to delete tone",
    })
  }
}
