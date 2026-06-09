import { db, schema, orm } from "@/lib/db"
import { randomUUIDv7 } from "bun"

export const findUnusedToken = async (token: string) => {
  return db.query.pairingTokens.findFirst({
    where: orm.and(
      orm.eq(schema.pairingTokens.token, token),
      orm.eq(schema.pairingTokens.used, false),
    ),
  })
}

export const createSession = async (
  pairingTokenId: string,
  deviceName: string,
) => {
  const sessionToken = randomUUIDv7() + "-" + randomUUIDv7()

  await db
    .update(schema.pairingTokens)
    .set({ used: true })
    .where(orm.eq(schema.pairingTokens.id, pairingTokenId))

  const [session] = await db
    .insert(schema.sessions)
    .values({ pairingTokenId, deviceName, sessionToken })
    .returning()

  return session!
}
