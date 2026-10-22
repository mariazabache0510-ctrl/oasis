import assert from "node:assert/strict"
import test from "node:test"
import { asExampleActivity, dayKey, filterByCategory, listEvents, mondayOf, parseDay, sampleEvents } from "./catalog.js"
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

test("los filtros Distracción, Bienestar y Lúdicas separan ejemplos", () => {
  const events = listEvents(new Date(2026, 9, 22))
  for (const category of ["distraccion", "bienestar", "ludica"] as const) {
    const filtered = filterByCategory(events, [category])
    assert.ok(filtered.length >= 1, category)
    for (const event of filtered) {
      assert.equal(event.category, category)
      assert.equal(event.sample, true)
    }
  }
  assert.equal(filterByCategory(events, []).length, events.length)
})

test("una actividad publicada queda como ejemplo y rechaza lenguaje clínico", () => {
  const good = asExampleActivity(
    {
      title: "Tarde de juegos",
      summary: "Juegos sin puntaje.",
      organizer: "Colegio",
      type: "organizacion",
      category: "ludica",
      date: "2026-10-22",
      time: "15:00",
      place: "Patio",
    },
    "pub-1",
  )
  assert.equal(good.ok, true)
  if (good.ok) {
    assert.equal(good.event.sample, true)
    assert.equal(good.event.sourceUrl, null)
    assert.equal(good.event.verifiedAt, null)
    assert.match(good.event.title, /^Ejemplo:/)
    assert.match(good.event.organizer, /ejemplo/i)
  }
  const clinical = asExampleActivity(
    {
      title: "Taller de diagnóstico",
      summary: "Una charla.",
      organizer: "Colegio",
      type: "organizacion",
      category: "bienestar",
      date: "2026-10-22",
      time: "15:00",
      place: "Aula",
    },
    "pub-2",
  )
  assert.equal(clinical.ok, false)
})

test("el .ics de un ejemplo lo dice en el título", () => {
  const ics = buildIcs(sampleEvents(new Date(2026, 9, 22))[0])
  assert.match(ics, /SUMMARY:\[Ejemplo\]/)
  assert.match(ics, /BEGIN:VEVENT/)
})
