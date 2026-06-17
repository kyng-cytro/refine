import { z } from "zod"

export const ModelProviderSchema = z.enum(["openrouter", "openai", "anthropic", "google"])

export const ModelSchema = z.object({
  id: z.string(),
  label: z.string(),
  provider: ModelProviderSchema,
  enabledByUser: z.boolean(),
  free: z.boolean().optional(),
  icon: z.string().optional(),
})

export const ProviderSchema = z.object({
  provider: ModelProviderSchema,
  enabled: z.boolean(),
  icon: z.string().optional(),
  docs: z.string().optional(),
  models: z.array(ModelSchema),
})

export const ProvidersResponseSchema = z.object({
  providers: z.array(ProviderSchema),
})

export const ToggleModelSchema = z.object({
  enabled: z.boolean(),
})

export type ModelProvider = z.infer<typeof ModelProviderSchema>
export type Model = z.infer<typeof ModelSchema>
export type Provider = z.infer<typeof ProviderSchema>
export type ProvidersResponse = z.infer<typeof ProvidersResponseSchema>
export type ToggleModel = z.infer<typeof ToggleModelSchema>
