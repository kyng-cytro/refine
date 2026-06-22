import { db, orm, schema } from "@/lib/db"
import { PROVIDERS } from "@/lib/models"
import type { ModelProvider } from "@refine/schemas"

export interface ResolvedModel {
  id: string
  label: string
  free: boolean
  provider: ModelProvider
  icon?: string
  globalEnabled: boolean
  sessionOverride: boolean | null
  effectiveEnabled: boolean
}

export interface ResolvedProvider {
  provider: ModelProvider
  label: string
  icon?: string
  docs?: string
  configured: boolean
  enabled: boolean
  usable: boolean
  models: ResolvedModel[]
}

export const resolveProviders = async (
  sessionId?: string,
): Promise<ResolvedProvider[]> => {
  const [providerRows, globalPrefs, sessionPrefs] = await Promise.all([
    db.query.providers.findMany(),
    db.query.userModelPrefs.findMany({
      where: orm.isNull(schema.userModelPrefs.sessionId),
    }),
    sessionId
      ? db.query.userModelPrefs.findMany({
          where: orm.eq(schema.userModelPrefs.sessionId, sessionId),
        })
      : Promise.resolve([]),
  ])

  const enabledByProvider = new Map(
    providerRows.map((p) => [p.slug, p.enabled]),
  )
  const globalDisabled = new Set(
    globalPrefs.filter((p) => !p.enabled).map((p) => p.modelId),
  )
  const sessionOverrides = new Map(
    sessionPrefs.map((p) => [p.modelId, p.enabled]),
  )

  return PROVIDERS.map((p) => {
    const configured = enabledByProvider.has(p.id)
    const enabled = enabledByProvider.get(p.id) ?? false
    const usable = configured && enabled

    const models: ResolvedModel[] = p.models.map((m) => {
      const globalEnabled = !globalDisabled.has(m.id)
      const sessionOverride = sessionOverrides.has(m.id)
        ? sessionOverrides.get(m.id)!
        : null
      const baseline =
        sessionOverride !== null ? sessionOverride : globalEnabled
      return {
        id: m.id,
        label: m.label,
        free: m.free ?? false,
        provider: p.id,
        icon: m.icon ?? p.icon,
        globalEnabled,
        sessionOverride,
        effectiveEnabled: usable && baseline,
      }
    })

    return {
      provider: p.id,
      label: p.label,
      icon: p.icon,
      docs: p.docs,
      configured,
      enabled,
      usable,
      models,
    }
  })
}

export const isModelEnabledForSession = async (
  modelId: string,
  sessionId: string,
): Promise<boolean> => {
  const providers = await resolveProviders(sessionId)
  for (const p of providers) {
    const model = p.models.find((m) => m.id === modelId)
    if (model) return model.effectiveEnabled
  }
  return false
}
