import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/tones/tones.dal"
import type {
  Create,
  List,
  Remove,
  Update,
} from "@/routes/admin/tones/tones.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List> = async (c) => {
  try {
    const tones = await dal.getAll()
    return c.json(tones, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TONES:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch global tones",
    })
  }
}

export const create: AppRouteHandler<Create> = async (c) => {
  try {
    const data = c.req.valid("json")
    const tone = await dal.create(data)
    if (!tone) throw new Error("Insert returned no row")
    return c.json(tone, HttpStatusCodes.CREATED)
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE")) {
      return c.json(
        { message: "A global tone with that slug already exists" },
        HttpStatusCodes.CONFLICT,
      )
    }
    c.var.logger.error(`[ADMIN:TONES:CREATE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to create global tone",
    })
  }
}

export const update: AppRouteHandler<Update> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    const data = c.req.valid("json")
    const tone = await dal.update(id, data)
    if (!tone)
      return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    return c.json(tone, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TONES:UPDATE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to update global tone",
    })
  }
}

export const remove: AppRouteHandler<Remove> = async (c) => {
  try {
    const { id } = c.req.valid("param")
    const deleted = await dal.remove(id)
    if (!deleted)
      return c.json({ message: "Not found" }, HttpStatusCodes.NOT_FOUND)
    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TONES:DELETE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to delete global tone",
    })
  }
}
