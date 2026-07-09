import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/usage/usage.dal"
import type { GetUsage } from "@/routes/admin/usage/usage.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const get: AppRouteHandler<GetUsage> = async (c) => {
  try {
    const { days } = c.req.valid("query")
    const usage = await dal.getUsage(days)
    const estimatedCost = usage.byModel.reduce(
      (acc, m) => acc + (m.cost ?? 0),
      0,
    )
    return c.json({ ...usage, estimatedCost }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:USAGE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch usage",
    })
  }
}
