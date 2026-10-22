import assert from "node:assert/strict"
import test from "node:test"
import { getService } from "../directory/catalog.js"
import { TRUST_MESSAGE, officialWhatsappHref, whatsappHref } from "./whatsapp.js"

test("un celular de 10 dígitos abre wa.me con el indicativo 57 y el texto preparado", () => {
  const href = whatsappHref("316 390 7010", TRUST_MESSAGE)
  assert.equal(href, `https://wa.me/573163907010?text=${encodeURIComponent(TRUST_MESSAGE)}`)
})

test("un número que ya trae 57 no se duplica y el texto se codifica", () => {
  const href = whatsappHref("57 316 390 7010", "Hola. Línea local")
  assert.equal(href, `https://wa.me/573163907010?text=${encodeURIComponent("Hola. Línea local")}`)
})

test("la línea 106 y la línea gratuita no se convierten en WhatsApp", () => {
  assert.equal(whatsappHref("106", "hola"), null)
  assert.equal(whatsappHref("01 8000 931 089", "hola"), null)
})

test("solo Yo Te Escucho, que ya trae WhatsApp en el catálogo, arma el enlace con su guion", () => {
  const local = getService("yo-te-escucho")
  const national = getService("linea-106")
  const free = getService("linea-018000")
  assert.ok(local && national && free)
  assert.equal(officialWhatsappHref(local), `https://wa.me/573163907010?text=${encodeURIComponent(local.script)}`)
  assert.equal(officialWhatsappHref(national), null)
  assert.equal(officialWhatsappHref(free), null)
})
