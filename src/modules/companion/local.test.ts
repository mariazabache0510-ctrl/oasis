import assert from "node:assert/strict"
import test from "node:test"
import { localCompanionReply, mentionsUnknownPhone, safeReply } from "./local.js"

test("una pregunta de domicilio muestra la ficha y no inventa visitas", () => {
  const reply = localCompanionReply("Me hacen domicilios?", "Loto")
  assert.equal(reply.service?.id, "yo-te-escucho")
  assert.match(reply.reply, /no puede confirmar/i)
  assert.equal(mentionsUnknownPhone(reply.reply), false)
  assert.match(reply.limit, /No diagnostico/)
})

test("un saludo no arrastra la ficha oficial", () => {
  const reply = localCompanionReply("Hola", "Bruma")
  assert.equal(reply.service, null)
  assert.match(reply.reply, /Bruma/)
})

test("otra ciudad sigue yendo a la línea 106", () => {
  const reply = localCompanionReply("Estoy en Bogotá y quiero llamar", "Loto")
  assert.equal(reply.service?.id, "linea-106")
})

test("una frase clínica del modelo se descarta", () => {
  const fallback = "Te acompaño. La ficha oficial está aquí."
  assert.equal(safeReply("Te receto un tratamiento de 20mg.", fallback), fallback)
  assert.equal(safeReply("Puedes llamar al 3001234567.", fallback), fallback)
  assert.equal(safeReply("Estoy aquí, a tu ritmo.", fallback), "Estoy aquí, a tu ritmo.")
})
