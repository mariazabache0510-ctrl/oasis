import assert from "node:assert/strict"
import test from "node:test"
import { matchCommand, normalize } from "./commands"

test("normaliza tildes, mayúsculas y signos", () => {
  assert.equal(normalize("¡Abre MI Rincón!"), "abre mi rincon")
})

test("entiende cada destino con la palabra sola", () => {
  const cases: [string, string][] = [
    ["inicio", "/inicio"], ["casa", "/inicio"],
    ["cerca", "/cerca"], ["cerca de mí", "/cerca"],
    ["rincón", "/rincon"], ["mi rincón", "/rincon"],
    ["hablar", "/hablar"], ["hablar con alguien", "/hablar"], ["ayuda", "/hablar"],
    ["recuerdo", "/recuerdo"], ["recuerdos", "/recuerdo"],
  ]
  for (const [said, to] of cases) assert.equal(matchCommand(said)?.to, to, said)
})

test("entiende frases completas", () => {
  assert.equal(matchCommand("abre mi rincón")?.to, "/rincon")
  assert.equal(matchCommand("ir a cerca")?.to, "/cerca")
  assert.equal(matchCommand("llévame a inicio")?.to, "/inicio")
  assert.equal(matchCommand("necesito ayuda")?.to, "/hablar")
})

test("no inventa destinos", () => {
  assert.equal(matchCommand("pon música"), null)
  assert.equal(matchCommand(""), null)
  assert.equal(matchCommand("incendio"), null)
})
