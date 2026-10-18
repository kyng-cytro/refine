import { z } from "zod"
import { PaginationQuerySchema, paginationResponse } from "../common"

export const HistoryItemSchema = z.object({
  id: z.string(),
  source: z.string(),
  refined: z.string(),
  modelId: z.string(),
  toneSlug: z.string(),
  isPrivate: z.boolean().optional(),
  createdAt: z.number(),
})

export const HistoryQuerySchema = PaginationQuerySchema

export const HistoryResponseSchema = paginationResponse(HistoryItemSchema)

export const AdminHistoryItemSchema = HistoryItemSchema.extend({
  deviceName: z.string().nullable(),
  sessionId: z.string(),
})

export const AdminHistoryResponseSchema = paginationResponse(
  AdminHistoryItemSchema,
)

export type HistoryItem = z.infer<typeof HistoryItemSchema>
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>
export type AdminHistoryItem = z.infer<typeof AdminHistoryItemSchema>
