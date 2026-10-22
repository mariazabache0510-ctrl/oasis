import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

const tokens = new Set<string>()

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0)
}

export function passwordsMatch(input: string, expected: string): boolean {
  const left = createHash("sha256").update(input).digest()
  const right = createHash("sha256").update(expected).digest()
  return timingSafeEqual(left, right)
}

export function loginAdmin(password: string): string | null {
  const expected = process.env.ADMIN_PASSWORD ?? ""
  if (!expected) return null
  if (!passwordsMatch(password, expected)) return null
  const token = randomBytes(24).toString("hex")
  tokens.add(token)
  return token
}

export function adminTokenOk(header: string | undefined): boolean {
  if (!header?.startsWith("Bearer ")) return false
  const token = header.slice("Bearer ".length).trim()
  return token.length > 0 && tokens.has(token)
}
