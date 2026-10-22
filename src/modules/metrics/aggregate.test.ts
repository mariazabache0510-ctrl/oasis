import assert from "node:assert/strict"
import test from "node:test"
import { aggregateKpis, syntheticKpiEvents, SYNTHETIC_COUNTS, toKpi } from "./aggregate.js"

test("la semilla sintética suma visitas, tonos, ayuda, distracción y agenda", () => {
  const summary = aggregateKpis(syntheticKpiEvents)
  assert.equal(summary.visits, SYNTHETIC_COUNTS.visits)
  assert.equal(summary.helpUses, SYNTHETIC_COUNTS.helpUses)
  assert.equal(summary.distractionUses, SYNTHETIC_COUNTS.distractionUses)
  assert.equal(summary.agendaOpens, SYNTHETIC_COUNTS.agendaOpens)
  assert.deepEqual(summary.moodByTone, SYNTHETIC_COUNTS.moodByTone)
})

test("un tono desconocido o un diario no entran en el agregado", () => {
  const summary = aggregateKpis([
    ...syntheticKpiEvents,
    { kind: "mood", tone: null },
  ])
  assert.deepEqual(summary.moodByTone, SYNTHETIC_COUNTS.moodByTone)
  assert.equal(toKpi("mood", "Maria"), null)
  assert.equal(toKpi("journal", null), null)
  assert.equal(toKpi("diagnostico", "pesado"), null)
  assert.deepEqual(toKpi("help_offer", null), { kind: "help", tone: null })
  assert.deepEqual(toKpi("mood", "calma"), { kind: "mood", tone: "calma" })
})
