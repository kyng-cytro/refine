import type { AppRouteHandler } from "@/lib/context"
import * as dal from "@/routes/admin/usage/usage.dal"
import type { GetUsage } from "@/routes/admin/usage/usage.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

// Operator-editable estimate: USD per 1M tokens, keyed by model id. Models not
// listed here are excluded from the cost estimate.
// e.g. "gpt-4o-mini": { input: 0.15, output: 0.6 }
const MODEL_PRICES: Record<string, { input: number; output: number }> = {}

export const get: AppRouteHandler<GetUsage> = async (c) => {
  try {
    const { days } = c.req.valid("query")
    const usage = await dal.getUsage(days)

    let estimatedCost = 0
    const byModel = usage.byModel.map((m) => {
      const price = MODEL_PRICES[m.key]
      const cost = price
        ? (m.inputTokens / 1e6) * price.input +
          (m.outputTokens / 1e6) * price.output
        : null
      if (cost) estimatedCost += cost
      return { ...m, cost }
    })

    return c.json({ ...usage, byModel, estimatedCost }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:USAGE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch usage",
    })
  }
}
