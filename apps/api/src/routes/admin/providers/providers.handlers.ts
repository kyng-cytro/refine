import { resolveProviders } from "@/lib/availability"
import type { AppRouteHandler } from "@/lib/context"
import { getModel } from "@/lib/models"
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
    return c.json(
      { configured: await dal.isConfigured(), url: Bun.env.HOST },
      HttpStatusCodes.OK,
    )
  } catch (error) {
    c.var.logger.error(`[ADMIN:SETUP:STATUS] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to check setup status",
    })
  }
}

export const listProviders: AppRouteHandler<ListProviders> = async (c) => {
  try {
    const resolved = await resolveProviders()
    return c.json(
      resolved.map((p) => ({
        provider: p.provider,
        enabled: p.enabled,
        hasKey: p.configured,
        models: p.models.map((m) => ({
          id: m.id,
          label: m.label,
          enabled: m.globalEnabled,
        })),
      })),
      HttpStatusCodes.OK,
    )
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
    return c.json(
      { provider: row.slug as ModelProvider, enabled: row.enabled },
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
    const config = getModel(modelId)
    if (!config || config.provider !== provider) {
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

export const toggleSessionModel: AppRouteHandler<ToggleSessionModel> = async (
  c,
) => {
  try {
    const { sessionId, modelId } = c.req.valid("param")
    const { enabled } = c.req.valid("json")
    if (!getModel(modelId)) {
      return c.json({ message: "Unknown model" }, HttpStatusCodes.BAD_REQUEST)
    }
    if (enabled === null) {
      await dal.clearSessionModel(modelId, sessionId)
      return c.json({ enabled: null }, HttpStatusCodes.OK)
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

export const listSessionModels: AppRouteHandler<ListSessionModels> = async (
  c,
) => {
  try {
    const { sessionId } = c.req.valid("param")
    const resolved = await resolveProviders(sessionId)
    return c.json(
      resolved.map((p) => ({
        provider: p.provider,
        label: p.label,
        configured: p.configured,
        enabled: p.enabled,
        usable: p.usable,
        models: p.models.map((m) => ({
          id: m.id,
          label: m.label,
          free: m.free,
          globalEnabled: m.globalEnabled,
          sessionOverride: m.sessionOverride,
          effectiveEnabled: m.effectiveEnabled,
        })),
      })),
      HttpStatusCodes.OK,
    )
  } catch (error) {
    c.var.logger.error(`[ADMIN:SESSIONS:MODEL:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch session model prefs",
    })
  }
}
