import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi"
import type { schema } from "@refine/db"
import type { Env, Schema } from "hono"
import type { PinoLogger } from "hono-pino"

type Session = typeof schema.sessions.$inferSelect

export interface CustomContext extends Env {
  Variables: {
    logger: PinoLogger
    session: Session | null
  }
}

export type AuthenticatedContext = CustomContext & {
  Variables: {
    session: Session
  }
}

export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<CustomContext, S>
export type AppRouteHandler<
  R extends RouteConfig,
  C extends CustomContext = CustomContext,
> = RouteHandler<R, C>
