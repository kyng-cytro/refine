import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import { ModelProviderSchema, ToggleModelSchema } from "@refine/schemas"
import * as responses from "@/lib/helpers/responses"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Admin / Providers"]

const UpsertSchema = z.object({
  apiKey: z.string().min(1),
  enabled: z.boolean().default(true),
})

export const upsert = createRoute({
  method: "put",
  path: "/admin/providers/{provider}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: z.object({ provider: ModelProviderSchema }),
    body: helpers.jsonContent(UpsertSchema, "Provider config"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.object({ provider: ModelProviderSchema, enabled: z.boolean() }),
      "Updated provider",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(UpsertSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "Configure a provider API key",
})

export const toggleModel = createRoute({
  method: "patch",
  path: "/admin/providers/{provider}/models/{modelId}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: z.object({
      provider: ModelProviderSchema,
      modelId: z.string().min(1),
    }),
    body: helpers.jsonContent(ToggleModelSchema, "Toggle model globally"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.object({ enabled: z.boolean() }),
      "Updated model availability",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(ToggleModelSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.badRequest,
    ...responses.serverError,
  },
  summary: "Enable or disable a model globally",
})

export type Upsert = typeof upsert
export type ToggleModel = typeof toggleModel
