import { db, schema, orm } from "@/lib/db"
import type { CustomContext } from "@/lib/context"
import { env } from "bun"
import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

export const authenticate = createMiddleware<CustomContext>(async (c, next) => {
  const header = c.req.header("Authorization")
  const token = header?.replace("Bearer ", "").trim()
  if (!token) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }
  const session = await db.query.sessions.findFirst({
    where: orm.eq(schema.sessions.sessionToken, token),
  })
  if (!session) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }
  c.set("session", session)
  return next()
})

export const adminAuth = createMiddleware(async (c, next) => {
  const token = c.req.header("X-Admin-Token")
  if (!token || token !== env.ADMIN_TOKEN) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }
  return next()
})
