import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/tokens/tokens.dal"
import type { Create, List } from "@/routes/admin/tokens/tokens.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List> = async (c) => {
  try {
    return c.json(await dal.getAll(), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TOKENS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch tokens",
    })
  }
}

export const create: AppRouteHandler<Create> = async (c) => {
  try {
    const { label, deviceType } = c.req.valid("json")
    return c.json(await dal.create(label, deviceType), HttpStatusCodes.CREATED)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TOKENS:CREATE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to create token",
    })
  }
}
