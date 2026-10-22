import assert from "node:assert/strict"
import test from "node:test"
import { ORIENTADOR_LIMIT, explainMatch, orient } from "./match.js"

const BANNED = /diagn[oó]st|tratamient|medicament|receta|dosis|suicid|prescri/i

test("una pregunta sobre otra ciudad orienta a la Línea 106", () => {
  const match = explainMatch("Estoy en Bogotá y no sé a quién llamar")
  assert.equal(match.service.id, "linea-106")
  assert.match(match.reason, /106/)
})

test("una pregunta por la línea gratuita orienta a 01 8000 931 089", () => {
  const match = explainMatch("Quiero la línea gratuita 018000")
  assert.equal(match.service.id, "linea-018000")
})

test("Villavicencio o WhatsApp orientan a Yo Te Escucho", () => {
  assert.equal(explainMatch("Estoy en Villavicencio y prefiero WhatsApp").service.id, "yo-te-escucho")
  assert.equal(explainMatch("Hoy fue un día largo").service.id, "yo-te-escucho")
})

test("cada orientación muestra el límite humano y no usa lenguaje clínico", () => {
  for (const question of ["", "Bogotá", "línea gratuita", "Villavicencio"]) {
    const result = orient(question)
    assert.equal(result.limit, ORIENTADOR_LIMIT)
    assert.match(result.limit, /No diagnostico/)
    assert.equal(BANNED.test(result.reason), false)
    assert.equal(result.intro, null)
  }
})
