import { z } from "zod"

export const PairRequestSchema = z.object({
  pairingToken: z.string().min(1),
  deviceName: z.string().min(1),
})

export const PairResponseSchema = z.object({
  sessionToken: z.string(),
})

export const SessionInfoSchema = z.object({
  id: z.string(),
  deviceName: z.string(),
  createdAt: z.number(),
})

export type PairRequest = z.infer<typeof PairRequestSchema>
export type PairResponse = z.infer<typeof PairResponseSchema>
export type SessionInfo = z.infer<typeof SessionInfoSchema>
