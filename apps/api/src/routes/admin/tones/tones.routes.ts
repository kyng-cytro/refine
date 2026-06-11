import * as responses from "@/lib/helpers/responses"
import { adminAuth } from "@/middlewares/auth"
import { createRoute, z } from "@hono/zod-openapi"
import {
  CreateToneSchema,
  IdParamSchema,
  ToneSchema,
  UpdateToneSchema,
} from "@refine/schemas"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { helpers } from "stoker/openapi"
import { createErrorSchema } from "stoker/openapi/schemas"

const tags = ["Admin / Tones"]

export const list = createRoute({
  method: "get",
  path: "/admin/tones",
  tags,
  middleware: [adminAuth] as const,
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      z.array(ToneSchema),
      "Global tones",
    ),
    ...responses.unauthorized,
    ...responses.serverError,
  },
  summary: "List all global tones",
})

export const create = createRoute({
  method: "post",
  path: "/admin/tones",
  tags,
  middleware: [adminAuth] as const,
  request: {
    body: helpers.jsonContent(CreateToneSchema, "Create global tone"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: helpers.jsonContent(
      ToneSchema,
      "Created global tone",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(CreateToneSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.conflict,
    ...responses.serverError,
  },
  summary: "Create a global tone",
})

export const update = createRoute({
  method: "put",
  path: "/admin/tones/{id}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: IdParamSchema,
    body: helpers.jsonContent(UpdateToneSchema, "Update global tone"),
  },
  responses: {
    [HttpStatusCodes.OK]: helpers.jsonContent(
      ToneSchema,
      "Updated global tone",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: helpers.jsonContent(
      createErrorSchema(UpdateToneSchema),
      "Validation error",
    ),
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Update a global tone",
})

export const remove = createRoute({
  method: "delete",
  path: "/admin/tones/{id}",
  tags,
  middleware: [adminAuth] as const,
  request: {
    params: IdParamSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Deleted" },
    ...responses.unauthorized,
    ...responses.notFound,
    ...responses.serverError,
  },
  summary: "Delete a global tone",
})

export type List = typeof list
export type Create = typeof create
export type Update = typeof update
export type Remove = typeof remove
