import type { AppRouteHandler } from "@/lib/context"
import { MODEL_MAP } from "@/lib/models"
import * as dal from "@/routes/admin/providers/providers.dal"
import type {
  ListProviders,
  ListSessionModels,
  SetupStatus,
  ToggleModel,
  ToggleSessionModel,
  Upsert,
} from "@/routes/admin/providers/providers.routes"
import type { ModelProvider } from "@refine/schemas"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const setupStatus: AppRouteHandler<SetupStatus> = async (c) => {
  try {
    return c.json({ configured: await dal.isConfigured(), url: Bun.env.HOST }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SETUP:STATUS] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to check setup status",
    })
  }
}

export const listProviders: AppRouteHandler<ListProviders> = async (c) => {
  try {
    return c.json(await dal.listAll(), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:PROVIDERS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch providers",
    })
  }
}

export const upsert: AppRouteHandler<Upsert> = async (c) => {
  try {
    const { provider } = c.req.valid("param")
    const { apiKey, enabled } = c.req.valid("json")
    const row = await dal.upsert(provider as ModelProvider, apiKey, enabled)
    return c.json({ provider: row.slug as ModelProvider, enabled: row.enabled }, HttpStatusCodes.OK)
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
      return c.json({ message: "Model not found for this provider" }, HttpStatusCodes.BAD_REQUEST)
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

export const toggleSessionModel: AppRouteHandler<ToggleSessionModel> = async (c) => {
  try {
    const { sessionId, modelId } = c.req.valid("param")
    const { enabled } = c.req.valid("json")
    if (!MODEL_MAP[modelId]) {
      return c.json({ message: "Unknown model" }, HttpStatusCodes.BAD_REQUEST)
    }
    const pref = await dal.toggleModel(modelId, enabled, sessionId)
    return c.json({ enabled: pref.enabled }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:MODEL:TOGGLE] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to toggle model for session",
    })
  }
}

export const listSessionModels: AppRouteHandler<ListSessionModels> = async (c) => {
  try {
    const { sessionId } = c.req.valid("param")
    const prefs = await dal.listSessionModelPrefs(sessionId)
    return c.json(prefs.map((p) => ({ modelId: p.modelId, enabled: p.enabled })), HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:MODEL:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch session model prefs",
    })
  }
}
