const ITERATIONS = 150_000

function toBase64(bytes: Uint8Array): string {
  let text = ""
  bytes.forEach((byte) => {
    text += String.fromCharCode(byte)
  })
  return btoa(text)
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const raw = atob(text)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index)
  return bytes
}

export function newSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromBase64(salt), iterations: ITERATIONS }, key, 256)
  return toBase64(new Uint8Array(bits))
}

export function sameHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return diff === 0
}
