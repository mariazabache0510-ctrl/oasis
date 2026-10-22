import assert from "node:assert/strict"
import test from "node:test"
import { ringWindow } from "./petalDirection.ts"

const bounds = [
  { start: 0.46, end: 1.58 },
  { start: 0.82, end: 2.12 },
  { start: 1.16, end: 2.68 },
]

test("por defecto los pétalos abren desde el centro", () => {
  const inner = ringWindow(0.46, 1.58, bounds, "outward")
  const outer = ringWindow(1.16, 2.68, bounds, "outward")
  assert.ok(inner.start < outer.start)
})

test("la dirección se puede invertir", () => {
  const inner = ringWindow(0.46, 1.58, bounds, "inward")
  const outer = ringWindow(1.16, 2.68, bounds, "inward")
  assert.ok(outer.start < inner.start)
  assert.equal(inner.end - inner.start, 1.12)
})
