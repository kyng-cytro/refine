import { resolveProviders } from "@/lib/availability"
import type { AppRouteHandler, AuthenticatedContext } from "@/lib/context"
import type { List } from "@/routes/providers/providers.routes"
import { HTTPException } from "hono/http-exception"
import * as HttpStatusCodes from "stoker/http-status-codes"

export const list: AppRouteHandler<List, AuthenticatedContext> = async (c) => {
  try {
    const resolved = await resolveProviders(c.var.session.id)
    const providers = resolved
      .filter((p) => p.usable)
      .map((p) => ({
        provider: p.provider,
        enabled: p.enabled,
        icon: p.icon,
        docs: p.docs,
        models: p.models
          .filter((m) => m.effectiveEnabled)
          .map((m) => ({
            id: m.id,
            label: m.label,
            provider: m.provider,
            enabledByUser: true,
            free: m.free,
            icon: m.icon,
          })),
      }))
      .filter((p) => p.models.length > 0)
    return c.json({ providers }, HttpStatusCodes.OK)
  } catch (error) {
    c.var.logger.error(`[PROVIDERS:LIST] ${error}`)
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch providers",
    })
  }
}
