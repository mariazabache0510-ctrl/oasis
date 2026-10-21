import { getService, listServices, type ServiceCard } from "../directory/catalog.js"

export const ORIENTADOR_LIMIT =
  "No soy un profesional. No diagnostico ni recomiendo tratamientos. Si quieres hablar con una persona, este es un canal oficial, con fuente y fecha."

export type Orientation = {
  service: ServiceCard
  limit: string
  intro: string | null
}

export function matchService(question: string): ServiceCard {
  const text = question.toLowerCase()
  if (/106|nacional|otra ciudad|bogot/.test(text)) {
    return getService("linea-106") ?? listServices()[0]
  }
  if (/018000|931\s?089|gratuita|fijo/.test(text)) {
    return getService("linea-018000") ?? listServices()[0]
  }
  return getService("yo-te-escucho") ?? listServices()[0]
}

export function orient(question: string): Orientation {
  return {
    service: matchService(question),
    limit: ORIENTADOR_LIMIT,
    intro: null,
  }
}
