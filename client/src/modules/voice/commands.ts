export type VoiceCommand = {
  to: string
  /** Nombre que se muestra en el aviso: "Abriendo Mi rincón…" */
  label: string
  /** Palabras clave ya normalizadas (minúsculas, sin tildes). */
  words: string[]
  /** Cómo se le sugiere decirlo a la persona. */
  example: string
}

export const COMMANDS: VoiceCommand[] = [
  { to: "/inicio", label: "Inicio", words: ["inicio", "casa"], example: "inicio" },
  { to: "/cerca", label: "Cerca", words: ["cerca de mi", "cerca"], example: "cerca de mí" },
  { to: "/rincon", label: "Mi rincón", words: ["mi rincon", "rincon"], example: "abre mi rincón" },
  { to: "/hablar", label: "Hablar con alguien", words: ["hablar con alguien", "hablar", "ayuda"], example: "hablar con alguien" },
  { to: "/recuerdo", label: "Lo que recuerdo", words: ["recuerdos", "recuerdo"], example: "recuerdos" },
]

/** Minúsculas, sin tildes ni signos, con espacios simples. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Busca una palabra clave en lo que se dijo. Sirve tanto para "rincón" como para
 * "abre mi rincón", "ir a cerca" o "llévame a inicio". Si se dicen dos, gana la primera.
 */
export function matchCommand(heard: string): VoiceCommand | null {
  const text = ` ${normalize(heard)} `
  let best: { command: VoiceCommand; at: number; size: number } | null = null
  for (const command of COMMANDS) {
    for (const word of command.words) {
      const at = text.indexOf(` ${word} `)
      if (at === -1) continue
      if (!best || at < best.at || (at === best.at && word.length > best.size)) best = { command, at, size: word.length }
    }
  }
  return best?.command ?? null
}
