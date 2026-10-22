export const KPI_KINDS = ["visit", "mood", "help", "distraction", "agenda"] as const
export type KpiKind = (typeof KPI_KINDS)[number]

export const MOOD_TONES = ["luminoso", "calma", "regular", "bajito", "pesado"] as const
export type MoodTone = (typeof MOOD_TONES)[number]

export type KpiEvent = {
  kind: KpiKind
  tone: MoodTone | null
}

export type KpiSummary = {
  visits: number
  moodByTone: Record<MoodTone, number>
  helpUses: number
  distractionUses: number
  agendaOpens: number
}

export const SYNTHETIC_COUNTS = {
  visits: 40,
  helpUses: 7,
  distractionUses: 15,
  agendaOpens: 12,
  moodByTone: { luminoso: 8, calma: 11, regular: 9, bajito: 6, pesado: 4 },
} as const

function repeat(kind: KpiKind, count: number, tone: MoodTone | null = null): KpiEvent[] {
  return Array.from({ length: count }, () => ({ kind, tone }))
}

/** Semilla anónima. No hay nombres, diarios ni identificadores. */
export const syntheticKpiEvents: KpiEvent[] = [
  ...repeat("visit", SYNTHETIC_COUNTS.visits),
  ...repeat("mood", SYNTHETIC_COUNTS.moodByTone.luminoso, "luminoso"),
  ...repeat("mood", SYNTHETIC_COUNTS.moodByTone.calma, "calma"),
  ...repeat("mood", SYNTHETIC_COUNTS.moodByTone.regular, "regular"),
  ...repeat("mood", SYNTHETIC_COUNTS.moodByTone.bajito, "bajito"),
  ...repeat("mood", SYNTHETIC_COUNTS.moodByTone.pesado, "pesado"),
  ...repeat("help", SYNTHETIC_COUNTS.helpUses),
  ...repeat("distraction", SYNTHETIC_COUNTS.distractionUses),
  ...repeat("agenda", SYNTHETIC_COUNTS.agendaOpens),
]

export function emptySummary(): KpiSummary {
  return {
    visits: 0,
    moodByTone: { luminoso: 0, calma: 0, regular: 0, bajito: 0, pesado: 0 },
    helpUses: 0,
    distractionUses: 0,
    agendaOpens: 0,
  }
}

export function aggregateKpis(events: KpiEvent[]): KpiSummary {
  const summary = emptySummary()
  for (const event of events) {
    if (event.kind === "visit") summary.visits += 1
    else if (event.kind === "help") summary.helpUses += 1
    else if (event.kind === "distraction") summary.distractionUses += 1
    else if (event.kind === "agenda") summary.agendaOpens += 1
    else if (event.kind === "mood" && event.tone && event.tone in summary.moodByTone) summary.moodByTone[event.tone] += 1
  }
  return summary
}

/** Acepta solo los cinco conteos. Un tono que no esté en la lista se descarta. */
export function toKpi(type: unknown, tone: unknown): KpiEvent | null {
  const kind = type === "help_offer" ? "help" : type
  if (typeof kind !== "string" || !KPI_KINDS.includes(kind as KpiKind)) return null
  if (kind === "mood") {
    if (typeof tone !== "string" || !MOOD_TONES.includes(tone as MoodTone)) return null
    return { kind: "mood", tone: tone as MoodTone }
  }
  return { kind: kind as KpiKind, tone: null }
}
