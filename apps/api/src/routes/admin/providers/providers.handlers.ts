import type { AppRouteHandler } from "@/lib/context"
import { MODEL_MAP } from "@/lib/models"
import * as dal from "@/routes/admin/providers/providers.dal"
import type {
  ToggleModel,
  Upsert,
} from "@/routes/admin/providers/providers.routes"
import type { ModelProvider } from "@refine/schemas"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const upsert: AppRouteHandler<Upsert> = async (c) => {
  try {
    const { provider } = c.req.valid("param")
    const { apiKey, enabled } = c.req.valid("json")
    const row = await dal.upsert(provider as ModelProvider, apiKey, enabled)
    return c.json(
      { provider: row.provider as ModelProvider, enabled: row.enabled },
      HttpStatusCodes.OK,
    )
  } catch (error) {
    c.var.logger.error(`[ADMIN:PROVIDERS:UPSERT] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to update provider",
    })
  }
}

export const toggleModel: AppRouteHandler<ToggleModel> = async (c) => {
  try {
    const { provider, modelId } = c.req.valid("param")
    const { enabled } = c.req.valid("json")
    const modelConfig = MODEL_MAP[modelId]
    if (!modelConfig || modelConfig.provider !== provider) {
      return c.json(
        { message: "Model not found for this provider" },
        HttpStatusCodes.BAD_REQUEST,
      )
    }
    const pref = await dal.toggleModel(modelId, enabled)
    return c.json({ enabled: pref.enabled }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:PROVIDERS:TOGGLE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to toggle model",
    })
  }
}
