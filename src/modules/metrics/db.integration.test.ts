import assert from "node:assert/strict"
import test from "node:test"

test(
  "postgres guarda un conteo anónimo cuando DATABASE_URL existe",
  {
    skip: process.env.DATABASE_URL ? false : "DATABASE_URL ausente: la experiencia local no depende de esta prueba",
  },
  async () => {
    const { ensureOps, readSummary, recordKpi, closeOps } = await import("./store.js")
    try {
      assert.equal(await ensureOps(), true)
      await recordKpi("visit", null)
      const summary = await readSummary()
      assert.equal(summary.source, "postgres")
      if (summary.source === "postgres") assert.ok(summary.kpis.visits >= 1)
    } finally {
      await closeOps()
    }
  },
)
