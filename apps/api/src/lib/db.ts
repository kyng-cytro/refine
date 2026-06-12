import { getClient, orm, paginate, schema } from "@refine/db"
import { env } from "bun"

const { db, client } = getClient(env.TURSO_DATABASE_URL ?? env.DATABASE_URL!, env.TURSO_AUTH_TOKEN)

export { client, db, orm, paginate, schema }
