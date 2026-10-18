import { z } from "zod"

const RangeSchema = z.object({ min: z.string(), latest: z.string() })

export const ServerMetaSchema = z.object({
  version: z.string(),
  clients: z.object({ desktop: RangeSchema, mobile: RangeSchema }),
})

export type ServerMeta = z.infer<typeof ServerMetaSchema>

export const UNSUPPORTED_CLIENT_CODE = "client_unsupported"

export const UpgradeRequiredSchema = z.object({
  message: z.string(),
  code: z.literal(UNSUPPORTED_CLIENT_CODE),
  min: z.string(),
})

export type UpgradeRequired = z.infer<typeof UpgradeRequiredSchema>
