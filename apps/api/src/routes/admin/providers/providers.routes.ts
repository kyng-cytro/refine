import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import {
  AdminSessionProviderSchema,
  ModelProviderSchema,
  ToggleModelSchema,
} from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Admin / Providers"]

const ModelStateSchema = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
})

const ProviderStateSchema = z.object({
  provider: ModelProviderSchema,
  enabled: z.boolean(),
  hasKey: z.boolean(),
  models: z.array(ModelStateSchema),
})

const UpsertSchema = z.object({
  apiKey: z.string().min(1).optional(),
  enabled: z.boolean().default(true),
})

const ToggleSessionModelSchema = z.object({
  enabled: z.boolean().nullable(),
})

export const setupStatus = createRoute({
  method: "get",
  path: "/admin/setup",
  tags,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.object({ configured: z.boolean(), url: z.string() }),
      "Setup status",
    ),
    ...responses.serverError,
  },
  summary: "Check whether the server has been configured",
})

export const listProviders = createRoute({
  method: "get",
  path: "/admin/providers",
  tags,
  middleware: [adminAuth] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.array(ProviderStateSchema),
      "Provider state",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List provider configuration and model states",
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

export const toggleSessionModel = createRoute({
  method: "patch",
  path: "/admin/sessions/{sessionId}/models/{modelId}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: z.object({
      sessionId: z.string().min(1),
      modelId: z.string().min(1),
    }),
    body: helpers.jsonContent(
      ToggleSessionModelSchema,
      "Toggle or clear model for session",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.object({ enabled: z.boolean().nullable() }),
      "Updated model availability for session",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(ToggleSessionModelSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.badRequest,
    ...responses.serverError,
  },
  summary: "Enable or disable a model for a specific device",
})

export const listSessionModels = createRoute({
  method: "get",
  path: "/admin/sessions/{sessionId}/models",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: z.object({ sessionId: z.string().min(1) }),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.array(AdminSessionProviderSchema),
      "Per-device provider and model availability",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List per-device provider and model availability",
})

export type SetupStatus = typeof setupStatus
export type ListProviders = typeof listProviders
export type Upsert = typeof upsert
export type ToggleModel = typeof toggleModel
export type ToggleSessionModel = typeof toggleSessionModel
export type ListSessionModels = typeof listSessionModels
