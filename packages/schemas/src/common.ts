import { z } from "zod"

export const IdParamSchema = z.object({
  id: z.string(),
})

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export const paginationResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    hasMore: z.boolean(),
    nextCursor: z.string().nullable(),
  })
