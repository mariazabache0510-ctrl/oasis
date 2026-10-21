import { Hono } from "hono"
import { orient, type Orientation } from "./match.js"

const BANNED =
  /diagn[oó]st|tratamient|medicament|receta|dosis|suicid|riesgo cl[ií]nic|prescri/i

async function warmerIntro(question: string, orientation: Orientation): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key || !question.trim()) return null
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash"
  const prompt = [
    "Escribe una sola frase corta, cálida y sencilla, en español, para acompañar esta información.",
    "No diagnostiques, no recetes, no hables de riesgo ni de tratamientos.",
    "No inventes teléfonos.",
    `La persona preguntó: ${question.slice(0, 280)}`,
    `El canal oficial ya elegido es: ${orientation.service.name}.`,
  ].join("\n")

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 80, temperature: 0.4 },
      }),
    },
  )
  if (!response.ok) return null
  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
  const sentence = text.split("\n")[0]?.slice(0, 220) ?? ""
  if (!sentence || BANNED.test(sentence)) return null
  return sentence
}

export function orientadorRoutes(): Hono {
  const routes = new Hono()
  routes.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const question = typeof body.question === "string" ? body.question : ""
    const orientation = orient(question)
    try {
      orientation.intro = await warmerIntro(question, orientation)
    } catch {
      orientation.intro = null
    }
    return c.json(orientation)
  })
  return routes
}
