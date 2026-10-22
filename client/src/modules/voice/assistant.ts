import { matchCommand, normalize, type VoiceCommand } from "./commands"

export type SpokenAuth = {
  name?: string
  email?: string
  password?: string
  mode?: "login" | "register"
  submit?: boolean
}

export function stripWake(heard: string): { woke: boolean; rest: string } {
  const folded = ` ${normalize(heard)} `
  if (!folded.includes(" oasis ")) return { woke: false, rest: heard.trim() }
  const rest = heard.replace(/oasis/i, " ").replace(/\s+/g, " ").trim()
  return { woke: true, rest }
}

function spokenEmail(folded: string): string | undefined {
  const spoken = folded.match(/\bcorreo(?: electronico)?\s+(.+?)(?=\s+clave|\s+contrasena|\s+ingresar|\s+entrar|\s+registr|$)/)
  if (!spoken) return undefined
  const email = spoken[1].replace(/\barroba\b/g, "@").replace(/\bpunto\b/g, ".").replace(/\s+/g, "")
  return email.includes("@") && email.includes(".") ? email : undefined
}

/** Lee correo, clave y la intención de enviar. La clave solo vuelve para el formulario. */
export function parseSpokenAuth(heard: string): SpokenAuth {
  const folded = normalize(heard)
  const result: SpokenAuth = {}
  if (/\b(registr|crear cuenta|crear mi cuenta)\b/.test(folded)) result.mode = "register"
  if (/\b(iniciar sesion|ya tengo cuenta)\b/.test(folded)) result.mode = "login"
  if (/\b(ingresar|entrar|iniciar sesion)\b/.test(folded)) result.submit = true
  if (/\b(registrarme|crear mi cuenta)\b/.test(folded)) {
    result.mode = "register"
    result.submit = true
  }
  const named = folded.match(/\b(?:me llamo|mi nombre es|soy)\s+([a-zñ ]{2,40}?)(?=\s+correo|\s+clave|\s+contrasena|\s+ingresar|\s+entrar|\s+registr|$)/)
  if (named) result.name = named[1].trim()
  const literal = heard.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  result.email = literal?.[0] ?? spokenEmail(folded)
  const pass = heard.match(/(?:clave|contraseña|contrasena)\s+(.+?)(?=\s+(?:ingresar|entrar|registrarme|registrarme|crear)\b|$)/i)
  if (pass) {
    const password = pass[1].trim()
    if (password && !/^oasis$/i.test(password)) result.password = password
  }
  return result
}

export function explainFor(path: string): string {
  if (path.startsWith("/hablar")) return "Hablar muestra los canales oficiales, con fuente y fecha. No es una consulta."
  if (path.startsWith("/cerca")) return "Cerca reúne las líneas oficiales y una agenda de ejemplo."
  if (path.startsWith("/rincon")) return "El rincón es para escribir, distraerte o dejar una nota. Se queda en este dispositivo."
  if (path.startsWith("/recuerdo")) return "Aquí configuras a tu compañero y ves lo que se guarda en este dispositivo."
  if (path.startsWith("/inicio")) return "Inicio es el lugar de hoy: una marca, unas puertas y la música si está conectada."
  return "Oasis te acompaña. Los canales oficiales están en Hablar, con fuente y fecha."
}

export type AssistantAction =
  | { type: "auth"; auth: SpokenAuth; said: string }
  | { type: "explain" }
  | { type: "chat" }
  | { type: "go"; command: VoiceCommand }
  | { type: "listen" }
  | { type: "unknown" }

export function interpret(heard: string, options: { requireWake: boolean; onEntrance: boolean }): AssistantAction {
  const wake = stripWake(heard)
  const rest = options.requireWake ? (wake.woke ? wake.rest : "") : heard.trim()
  if (options.requireWake && !wake.woke) return { type: "unknown" }
  if (!rest) return { type: "listen" }
  const folded = normalize(rest)
  if (options.onEntrance) {
    const auth = parseSpokenAuth(rest)
    if (auth.email || auth.password || auth.name || auth.submit || auth.mode) return { type: "auth", auth, said: "Listo." }
  }
  if (/\b(explica|explicame|leeme|que es|cuentame)\b/.test(folded)) return { type: "explain" }
  if (/\b(chat|companero|companera)\b/.test(folded)) return { type: "chat" }
  const command = matchCommand(rest)
  if (command) return { type: "go", command }
  return { type: "unknown" }
}
