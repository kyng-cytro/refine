import type { AppRouteHandler } from "@/lib/context"
import type { Create, List } from "@/routes/admin/tokens/tokens.routes"
import * as dal from "@/routes/admin/tokens/tokens.dal"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

const mapToken = (row: any) => ({
  id: row.id,
  token: row.token,
  label: row.label,
  used: row.used,
  createdAt: row.createdAt.getTime(),
})

export const list: AppRouteHandler<List> = async (c) => {
  try {
    const tokens = await dal.getAll()
    return c.json(tokens.map(mapToken), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TOKENS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch tokens",
    })
  }
}

export const create: AppRouteHandler<Create> = async (c) => {
  try {
    const { label } = c.req.valid("json")
    const token = await dal.create(label)
    return c.json(mapToken(token), HttpStatusCodes.CREATED)
  } catch (error) {
    c.var.logger.error(`[ADMIN:TOKENS:CREATE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to create token",
    })
  }
}
