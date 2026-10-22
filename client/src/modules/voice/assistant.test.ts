import assert from "node:assert/strict"
import test from "node:test"
import { interpret, parseSpokenAuth, stripWake } from "./assistant.ts"

test("la palabra Oasis despierta y deja el resto", () => {
  const wake = stripWake("Oasis, abre mi rincón")
  assert.equal(wake.woke, true)
  assert.match(wake.rest.toLowerCase(), /abre mi rincon|abre mi rincón/)
  assert.equal(stripWake("abre mi rincón").woke, false)
})

test("sin la palabra Oasis no navega en escucha continua", () => {
  assert.equal(interpret("abre mi rincón", { requireWake: true, onEntrance: false }).type, "unknown")
  const woken = interpret("Oasis abre mi rincón", { requireWake: true, onEntrance: false })
  assert.equal(woken.type, "go")
  if (woken.type === "go") assert.equal(woken.command.to, "/rincon")
})

test("el botón sigue entendiendo el comando directo", () => {
  const direct = interpret("abre mi rincón", { requireWake: false, onEntrance: false })
  assert.equal(direct.type, "go")
})

test("en la entrada llena correo y clave sin devolver la clave en el aviso", () => {
  const heard = "correo ana arroba oasis punto com clave Secreta12 ingresar"
  const parsed = parseSpokenAuth(heard)
  assert.equal(parsed.email, "ana@oasis.com")
  assert.equal(parsed.password, "Secreta12")
  assert.equal(parsed.submit, true)
  const action = interpret(heard, { requireWake: false, onEntrance: true })
  assert.equal(action.type, "auth")
  if (action.type === "auth") {
    assert.equal(action.auth.password, "Secreta12")
    assert.equal(action.said.includes("Secreta12"), false)
  }
})
