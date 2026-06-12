import { z } from "zod"
import { PaginationQuerySchema, paginationResponse } from "../common"

export const HistoryItemSchema = z.object({
  id: z.string(),
  source: z.string(),
  refined: z.string(),
  modelId: z.string(),
  toneSlug: z.string(),
  createdAt: z.number(),
})

export const HistoryQuerySchema = PaginationQuerySchema

export const HistoryResponseSchema = paginationResponse(HistoryItemSchema)

export type HistoryItem = z.infer<typeof HistoryItemSchema>
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>
export type HistoryResponse = z.infer<typeof HistoryResponseSchema>
