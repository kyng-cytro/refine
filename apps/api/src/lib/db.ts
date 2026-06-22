import { getClient, orm, paginate, schema } from "@refine/db"
import { env } from "bun"

const { db } = getClient(env.DATABASE_URL, env.TURSO_AUTH_TOKEN)

export { db, orm, paginate, schema }
