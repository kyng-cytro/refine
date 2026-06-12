import { z } from "zod"

export const AdminTokenSchema = z.object({
  id: z.string(),
  token: z.string(),
  label: z.string(),
  used: z.boolean(),
  createdAt: z.number(),
  link: z.string(),
})

export const AdminSessionSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  createdAt: z.number(),
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

export const SetupStatusSchema = z.object({
  configured: z.boolean(),
  url: z.string(),
})

export type AdminToken = z.infer<typeof AdminTokenSchema>
export type AdminSession = z.infer<typeof AdminSessionSchema>
export type AdminModelState = z.infer<typeof AdminModelStateSchema>
export type AdminProviderState = z.infer<typeof AdminProviderStateSchema>
export type SessionModelPref = z.infer<typeof SessionModelPrefSchema>
export type SetupStatus = z.infer<typeof SetupStatusSchema>
