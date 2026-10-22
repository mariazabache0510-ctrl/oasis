import { getService, listServices, type ServiceCard } from "../directory/catalog.js"

export const ORIENTADOR_LIMIT =
  "No soy un profesional. No diagnostico ni recomiendo tratamientos. Si quieres hablar con una persona, este es un canal oficial, con fuente y fecha."

export type Orientation = {
  service: ServiceCard
  limit: string
  intro: string | null
  reason: string
}

export type Match = {
  service: ServiceCard
  reason: string
}

export function explainMatch(question: string): Match {
  const text = question.toLowerCase()
  const national = getService("linea-106") ?? listServices()[0]
  const free = getService("linea-018000") ?? listServices()[0]
  const local = getService("yo-te-escucho") ?? listServices()[0]
  if (/106|nacional|otra ciudad|bogot|fuera de villavicencio/.test(text)) {
    return {
      service: national,
      reason: "Mencionas otra ciudad o la línea nacional. Quien puede orientarte por teléfono es la Línea 106.",
    }
  }
  if (/018000|931\s?089|gratuita|fijo/.test(text)) {
    return {
      service: free,
      reason: "Mencionas la línea gratuita o un teléfono fijo. El canal es la Línea 01 8000 931 089.",
    }
  }
  if (/whatsapp|villavicencio|alcald/.test(text)) {
    return {
      service: local,
      reason: "En Villavicencio, el canal con llamada y WhatsApp es Yo Te Escucho. No es una consulta.",
    }
  }
  return {
    service: local,
    reason: "Si no aparece otra ciudad ni la línea gratuita, el canal local es Yo Te Escucho Villavicencio.",
  }
}

export function matchService(question: string): ServiceCard {
  return explainMatch(question).service
}

function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/** La persona pide un canal, una llamada o algo que este espacio no puede resolver (diagnóstico, tratamiento). */
export function helpIntent(question: string): boolean {
  return /\b(domicil\w*|llam\w*|linea|106|018000|931089|whatsapp|villavicencio|ayuda|canal|telefon\w*|escuch\w*|hablar|consulta|cita|urgenc\w*|alguien|medicament\w*|diagnostic\w*|tratamient\w*|receta|dosis)\b/.test(fold(question))
}

export function asksClinical(question: string): boolean {
  return /\b(medicament\w*|diagnostic\w*|tratamient\w*|receta|dosis)\b/.test(fold(question))
}

export function orient(question: string): Orientation {
  const match = explainMatch(question)
  return {
    service: match.service,
    limit: ORIENTADOR_LIMIT,
    intro: null,
    reason: match.reason,
  }
}
