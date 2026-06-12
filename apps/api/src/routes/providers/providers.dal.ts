import { db, orm, schema } from "@/lib/db"

export const list = async () => {
  return db.query.providers.findMany({
    where: orm.eq(schema.providers.enabled, true),
  })
}

export const listGlobalPrefs = async () => {
  return db.query.userModelPrefs.findMany({
    where: orm.isNull(schema.userModelPrefs.sessionId),
  })
}
