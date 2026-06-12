import { getClient, orm, paginate, schema } from "@refine/db"
import { env } from "bun"

const { db, client } = getClient(env.DATABASE_URL)

export { client, db, orm, paginate, schema }
