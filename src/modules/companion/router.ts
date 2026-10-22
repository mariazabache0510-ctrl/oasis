import { Hono } from "hono"
import { localCompanionReply, safeReply, type ChatTurn } from "./local.js"

const MAX_TURNS = 8

function asHistory(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return []
  const turns: ChatTurn[] = []
  for (const item of value.slice(-MAX_TURNS)) {
    if (!item || typeof item !== "object") continue
    const record = item as { role?: unknown; text?: unknown }
    if ((record.role !== "person" && record.role !== "companion") || typeof record.text !== "string") continue
    const text = record.text.trim().slice(0, 400)
    if (!text) continue
    turns.push({ role: record.role, text })
  }
  return turns
}

async function geminiReply(input: { message: string; name: string; note: string; history: ChatTurn[]; serviceName: string | null }): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key || !input.message.trim()) return null
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash"
  const history = input.history
    .map((turn) => `${turn.role === "person" ? "Persona" : input.name}: ${turn.text}`)
    .join("\n")
  const prompt = [
    `Eres ${input.name}, compañero de Oasis. Hablas en español, corto y cálido, como alguien que se queda.`,
    "No eres un profesional. No diagnostiques, no recetes, no recomiendes tratamientos ni medicamentos.",
    "No inventes números de teléfono.",
    input.note ? `La persona quiere ser acompañada así: ${input.note.slice(0, 280)}` : "",
    history ? `Conversación reciente, solo del chat:\n${history}` : "",
    input.serviceName
      ? `Si pide ayuda, puedes nombrar este canal oficial ya elegido: ${input.serviceName}. No des otro número.`
      : "Si no pide un canal, no menciones teléfonos.",
    `Mensaje nuevo: ${input.message.slice(0, 400)}`,
    "Responde en máximo dos frases.",
  ]
    .filter(Boolean)
    .join("\n")

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 120, temperature: 0.5 },
    }),
  })
  if (!response.ok) return null
  const payload = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  return payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
}

export function companionRoutes(): Hono {
  const routes = new Hono()
  routes.post("/", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      message?: unknown
      companionName?: unknown
      note?: unknown
      history?: unknown
    }
    const message = typeof body.message === "string" ? body.message.slice(0, 400) : ""
    const companionName = typeof body.companionName === "string" ? body.companionName.slice(0, 40) : ""
    const note = typeof body.note === "string" ? body.note.slice(0, 280) : ""
    const history = asHistory(body.history)
    const local = localCompanionReply(message, companionName)
    try {
      const drafted = await geminiReply({
        message,
        name: companionName.trim() || "Loto",
        note,
        history,
        serviceName: local.service?.name ?? null,
      })
      if (drafted) local.reply = safeReply(drafted, local.reply)
    } catch {
      /* la frase local sigue */
    }
    return c.json(local)
  })
  return routes
}
