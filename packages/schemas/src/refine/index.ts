import { z } from "zod"

export const RefineRequestSchema = z.object({
  text: z.string().min(1).max(4000),
  modelId: z.string().min(1),
  toneSlug: z.string().min(1),
  save: z.boolean().optional(),
  private: z.boolean().optional(),
})

export const RefineResponseSchema = z.object({
  refined: z.string(),
})

export type RefineRequest = z.infer<typeof RefineRequestSchema>
export type RefineResponse = z.infer<typeof RefineResponseSchema>
