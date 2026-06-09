import { getClient, schema, orm, paginate } from "@refine/db"
import { env } from "bun"

const { db, client } = getClient(env.DATABASE_URL ?? "./refine.db")

export { db, client, schema, orm, paginate }
