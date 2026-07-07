import { DeviceTypeSchema } from "../common"
import { z } from "zod"

export const AdminTokenSchema = z.object({
  id: z.string(),
  token: z.string(),
  label: z.string(),
  used: z.boolean(),
  deviceType: DeviceTypeSchema,
  createdAt: z.number(),
  link: z.string(),
})

export const AdminSessionSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  deviceType: DeviceTypeSchema,
  createdAt: z.number(),
  expiresAt: z.number().nullable(),
  pairingTokenLabel: z.string(),
})

export const AdminModelStateSchema = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
})

export const AdminProviderStateSchema = z.object({
  provider: z.string(),
  enabled: z.boolean(),
  hasKey: z.boolean(),
  models: z.array(AdminModelStateSchema),
})

export const SessionModelPrefSchema = z.object({
  modelId: z.string(),
  enabled: z.boolean(),
})

export const AdminSessionModelSchema = z.object({
  id: z.string(),
  label: z.string(),
  free: z.boolean(),
  globalEnabled: z.boolean(),
  sessionOverride: z.boolean().nullable(),
  effectiveEnabled: z.boolean(),
})

export const AdminSessionProviderSchema = z.object({
  provider: z.string(),
  label: z.string(),
  configured: z.boolean(),
  enabled: z.boolean(),
  usable: z.boolean(),
  models: z.array(AdminSessionModelSchema),
})

export const SetupStatusSchema = z.object({
  configured: z.boolean(),
  url: z.string(),
})

export type AdminToken = z.infer<typeof AdminTokenSchema>
export type AdminSession = z.infer<typeof AdminSessionSchema>
export type AdminProviderState = z.infer<typeof AdminProviderStateSchema>
export type SessionModelPref = z.infer<typeof SessionModelPrefSchema>
export type AdminSessionModel = z.infer<typeof AdminSessionModelSchema>
export type AdminSessionProvider = z.infer<typeof AdminSessionProviderSchema>
export type SetupStatus = z.infer<typeof SetupStatusSchema>
