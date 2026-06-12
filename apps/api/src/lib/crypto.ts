import { env } from "bun"

const ALG = "aes-256-gcm"
const IV_LEN = 12

const key = () =>
  crypto.subtle.importKey(
    "raw",
    Buffer.from(env.ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  )

export const encrypt = async (plain: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const encoded = new TextEncoder().encode(plain)
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), encoded)
  const buf = Buffer.concat([iv, new Uint8Array(cipher)])
  return buf.toString("base64")
}

export const decrypt = async (ciphertext: string): Promise<string> => {
  const buf = Buffer.from(ciphertext, "base64")
  const iv = buf.subarray(0, IV_LEN)
  const data = buf.subarray(IV_LEN)
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await key(), data)
  return new TextDecoder().decode(plain)
}
