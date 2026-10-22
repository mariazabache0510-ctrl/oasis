import { getService, type ServiceCard } from "../directory/catalog.js"
import { asksClinical, explainMatch, helpIntent, ORIENTADOR_LIMIT } from "../orientador/match.js"

export type ChatTurn = { role: "person" | "companion"; text: string }

export type CompanionReply = {
  reply: string
  limit: string
  service: ServiceCard | null
  reason: string | null
}

const BANNED = /diagn[oó]stic|tratamient|medicament|receta|dosis|prescri/i
const KNOWN_NUMBERS = ["106", "3163907010", "018000931089", "18000931089", "573163907010"]

export function mentionsUnknownPhone(text: string): boolean {
  const chunks = text.match(/\d[\d\s.-]{1,}\d|\b\d{3,}\b/g) ?? []
  return chunks.some((chunk) => {
    const digits = chunk.replace(/\D/g, "")
    if (digits.length < 3) return false
    if (digits.length <= 4 && digits !== "106") return false
    return !KNOWN_NUMBERS.some((known) => known === digits || known.endsWith(digits) || digits.endsWith(known))
  })
}

/** Si el modelo se sale del límite, se queda la frase local. */
export function safeReply(text: string, fallback: string): string {
  const sentence = text.replace(/\s+/g, " ").trim().slice(0, 320)
  if (!sentence || BANNED.test(sentence) || mentionsUnknownPhone(sentence)) return fallback
  return sentence
}

export function localCompanionReply(message: string, name: string): CompanionReply {
  const who = name.trim() || "Loto"
  const text = message.trim()
  const limit = ORIENTADOR_LIMIT
  if (!text) {
    return { reply: `Aquí estoy. Cuando quieras, me escribes.`, limit, service: null, reason: null }
  }
  const match = explainMatch(text)
  if (asksClinical(text)) {
    return {
      reply: `${who} no puede resolver eso. Si quieres hablar con una persona, la ficha de abajo es el canal oficial, con fuente y fecha.`,
      limit,
      service: match.service,
      reason: match.reason,
    }
  }
  if (helpIntent(text)) {
    const reply = /domicil/.test(text.toLowerCase())
      ? `${who} no puede confirmar si hacen visitas a casa. Lo publicado es el canal oficial: el número, la fuente y la fecha están en la ficha.`
      : `${who} está aquí. ${match.reason}`
    return { reply, limit, service: match.service, reason: match.reason }
  }
  if (/\bhola\b|\bbuenas\b|\bhey\b/.test(text.toLowerCase())) {
    return { reply: `Hola. Soy ${who}. Me quedo contigo, sin prisa.`, limit, service: null, reason: null }
  }
  return {
    reply: `Te leo. Soy ${who} y sigo aquí. Si quieres un canal oficial, dímelo y te muestro la ficha con fuente y fecha.`,
    limit,
    service: null,
    reason: null,
  }
}

export function serviceFromId(id: string | undefined): ServiceCard | null {
  if (!id) return null
  return getService(id) ?? null
}
