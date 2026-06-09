import type { AppRouteHandler, AuthenticatedContext } from "@/lib/context"
import type { List } from "@/routes/providers/providers.routes"
import * as dal from "@/routes/providers/providers.dal"
import { MODELS } from "@/constants/models"
import type { ModelProvider } from "@refine/schemas"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List, AuthenticatedContext> = async (c) => {
  try {
    const [enabledProviders, modelPrefs] = await Promise.all([
      dal.list(),
      dal.listPrefs(),
    ])

    const disabledModels = new Set(
      modelPrefs.filter((p) => !p.enabled).map((p) => p.modelId),
    )

    const providers = enabledProviders.map((p) => {
      const providerModels = MODELS.filter((m) => m.provider === p.provider)
      return {
        provider: p.provider as ModelProvider,
        enabled: p.enabled,
        models: providerModels
          .filter((m) => !disabledModels.has(m.id))
          .map((m) => ({
            id: m.id,
            label: m.label,
            provider: m.provider,
            enabledByUser: true,
          })),
      }
    })

    return c.json({ providers }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[PROVIDERS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch providers",
    })
  }
}
