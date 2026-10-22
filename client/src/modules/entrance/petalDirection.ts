export type PetalDirection = "outward" | "inward"

export type RingWindow = { start: number; end: number }

/**
 * outward: el anillo interior abre primero (desde el centro hacia afuera).
 * inward: se invierte el tiempo para que abra primero el anillo exterior.
 */
export function ringWindow(start: number, end: number, bounds: RingWindow[], direction: PetalDirection): RingWindow {
  if (direction === "outward" || bounds.length === 0) return { start, end }
  const min = Math.min(...bounds.map((item) => item.start))
  const max = Math.max(...bounds.map((item) => item.end))
  const span = end - start
  const next = min + (max - end)
  return { start: next, end: next + span }
}
