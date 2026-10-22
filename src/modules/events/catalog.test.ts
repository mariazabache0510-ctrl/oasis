import assert from "node:assert/strict"
import test from "node:test"
import { dayKey, listEvents, mondayOf, parseDay, sampleEvents } from "./catalog.js"
import { buildIcs } from "./ics.js"

test("hay de 4 a 6 eventos de ejemplo, todos marcados como ejemplo y sin fuente inventada", () => {
  const events = listEvents(new Date(2026, 9, 22))
  assert.ok(events.length >= 4 && events.length <= 6)
  for (const event of events) {
    assert.equal(event.sample, true)
    assert.equal(event.sourceUrl, null)
    assert.equal(event.verifiedAt, null)
  }
})

test("los ejemplos caen dentro de la semana de referencia, de lunes a domingo", () => {
  const anchor = new Date(2026, 9, 25) // domingo
  const monday = mondayOf(anchor)
  assert.equal(dayKey(monday), "2026-10-19")
  for (const event of sampleEvents(anchor)) {
    const offset = Math.round((parseDay(event.date).getTime() - monday.getTime()) / 86_400_000)
    assert.ok(offset >= 0 && offset <= 6, event.date)
  }
})

test("el .ics de un ejemplo lo dice en el título", () => {
  const ics = buildIcs(sampleEvents(new Date(2026, 9, 22))[0])
  assert.match(ics, /SUMMARY:\[Ejemplo\]/)
  assert.match(ics, /BEGIN:VEVENT/)
})
