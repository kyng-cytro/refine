import { z } from "zod"

export const ToneSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  instructions: z.string(),
  isGlobal: z.boolean(),
  sessionId: z.string().nullable(),
})

export const CreateToneSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  instructions: z.string().min(1).max(2000),
})

export const UpdateToneSchema = CreateToneSchema.partial()

export type Tone = z.infer<typeof ToneSchema>
export type CreateTone = z.infer<typeof CreateToneSchema>
export type UpdateTone = z.infer<typeof UpdateToneSchema>
