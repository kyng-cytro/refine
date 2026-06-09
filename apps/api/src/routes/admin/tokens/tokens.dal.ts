import { db, schema, orm } from "@/lib/db"

const TOKEN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"

const generateToken = (length = 32) => {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)]
  }
  return result
}

export const getAll = async () => {
  return db.query.pairingTokens.findMany({
    orderBy: (t) => [orm.desc(t.createdAt)],
  })
}

export const create = async (label: string) => {
  const token = generateToken()
  const [row] = await db
    .insert(schema.pairingTokens)
    .values({ token, label })
    .returning()
  return row!
}
