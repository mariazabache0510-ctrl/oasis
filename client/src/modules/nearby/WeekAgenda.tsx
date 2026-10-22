import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { activityCategories, dayKey, eventTypes, filterByCategory, listEvents, parseDay, type ActivityCategory, type EventType, type WellnessEvent } from "@modules/events/catalog"
import { buildIcs } from "@modules/events/ics"
import { OasisCard, type CardTone } from "../shell/OasisCard"
import { CalendarIcon } from "../home/Icons"
import { track } from "../shell/track"

const DAY_NAMES = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]

const TONE: Record<EventType, CardTone> = {
  alcaldia: "peach",
  universidad: "sky",
  "casa-cultura": "lilac",
  "entidad-publica": "butter",
  organizacion: "mint",
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function mondayOf(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7))
}

function typeLabel(type: EventType): string {
  return eventTypes.find((item) => item.id === type)?.label ?? type
}

function categoryLabel(category: ActivityCategory): string {
  return activityCategories.find((item) => item.id === category)?.label ?? category
}

function clock(time: string): { hour: string; suffix: string } {
  const [hour, minute] = time.split(":").map(Number)
  return { hour: `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, "0")}`, suffix: hour >= 12 ? "p. m." : "a. m." }
}

function shortDate(value: string): string {
  return parseDay(value).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "fuente"
  }
}

function download(event: WellnessEvent) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${event.id}.ics`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function WeekAgenda() {
  const today = useMemo(() => new Date(), [])
  const [events, setEvents] = useState<WellnessEvent[]>(() => listEvents(today))
  const [weekStart, setWeekStart] = useState(() => mondayOf(today))
  const [selected, setSelected] = useState(today)
  const [active, setActive] = useState<Set<ActivityCategory>>(new Set())

  useEffect(() => {
    track("agenda")
  }, [])

  // El servidor es la fuente; si no responde (sin internet) queda la agenda incluida en la app.
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/events/agenda?today=${dayKey(today)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { events?: WellnessEvent[] } | null) => {
        if (data?.events) setEvents(data.events)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [today])

  const visible = (items: WellnessEvent[]) => filterByCategory(items, [...active])
  const onDay = (date: Date) => visible(events.filter((item) => item.date === dayKey(date)))

  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const weekEnd = days[6]
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const weekLabel = sameMonth
    ? `${weekStart.getDate()} – ${weekEnd.getDate()} de ${weekEnd.toLocaleDateString("es-CO", { month: "long" })}`
    : `${weekStart.getDate()} ${weekStart.toLocaleDateString("es-CO", { month: "short" })} – ${weekEnd.getDate()} ${weekEnd.toLocaleDateString("es-CO", { month: "short" })}`

  const items = onDay(selected)
  const isToday = dayKey(selected) === dayKey(today)
  const allSample = events.every((item) => item.sample)
  const dayName = capitalize(selected.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }))

  function moveWeek(step: number) {
    setWeekStart((current) => addDays(current, step * 7))
    setSelected((current) => addDays(current, step * 7))
  }

  function goToday() {
    setWeekStart(mondayOf(today))
    setSelected(today)
  }

  function toggle(category: ActivityCategory) {
    setActive((current) => {
      const next = new Set(current)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  return (
    <section className="agenda" aria-labelledby="agenda-title">
      <div className="agenda-head">
        <div className="tile-badge agenda-badge" aria-hidden="true">
          <CalendarIcon />
        </div>
        <div>
          <p className="eyebrow eyebrow-pill">Agenda de bienestar</p>
          <h2 className="oasis-title agenda-title" id="agenda-title">
            ¿Qué hay esta semana?
          </h2>
        </div>
      </div>
      <p className="muted agenda-lede">
        Filtros de ejemplo: Distracción, Bienestar y Lúdicas. Nada de esta lista está confirmado como actividad real.
      </p>
      {allSample ? (
        <p className="agenda-sample" role="note">
          <span className="agenda-sample-dot" aria-hidden="true" /> Estos eventos son de ejemplo. Aún no hay actividades reales cargadas.
        </p>
      ) : null}

      <div className="agenda-filters" role="group" aria-label="Filtrar por Distracción, Bienestar o Lúdicas">
        <button className="ag-chip ag-today" type="button" aria-pressed={isToday} onClick={goToday}>
          <i aria-hidden="true" />
          Hoy
        </button>
        {activityCategories.map((category) => (
          <button key={category.id} className="ag-chip" data-category={category.id} type="button" aria-pressed={active.has(category.id)} onClick={() => toggle(category.id)}>
            <i aria-hidden="true" />
            {category.label}
          </button>
        ))}
      </div>

      <OasisCard tone="sky" className="week">
        <div className="week-top">
          <button className="week-nav" type="button" aria-label="Semana anterior" onClick={() => moveWeek(-1)}>
            ‹
          </button>
          <p className="week-label" key={weekLabel} aria-live="polite">
            {weekLabel}
          </p>
          <button className="week-nav" type="button" aria-label="Semana siguiente" onClick={() => moveWeek(1)}>
            ›
          </button>
        </div>
        <div className="week-strip">
          {days.map((date, index) => {
            const count = onDay(date)
            const categories = Array.from(new Set(count.map((item) => item.category))).slice(0, 3)
            const here = dayKey(date) === dayKey(selected)
            return (
              <button
                key={dayKey(date)}
                className={dayKey(date) === dayKey(today) ? "wk-day is-today" : "wk-day"}
                style={{ "--k": index } as CSSProperties}
                type="button"
                aria-pressed={here}
                aria-label={`${date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}, ${count.length === 1 ? "1 actividad" : `${count.length} actividades`}`}
                onClick={() => setSelected(date)}
              >
                <small>{DAY_NAMES[index]}</small>
                <b>{date.getDate()}</b>
                <span className="wk-dots" aria-hidden="true">
                  {categories.map((category) => (
                    <i key={category} data-category={category} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </OasisCard>

      <div className="agenda-day">
        <div className="agenda-day-head" key={dayKey(selected)} aria-live="polite">
          <p className="agenda-day-name">{dayName}</p>
          <p className="agenda-day-count">
            {isToday ? "Hoy · " : ""}
            {items.length === 0 ? "Sin actividades" : items.length === 1 ? "1 actividad" : `${items.length} actividades`}
          </p>
        </div>

        {items.length === 0 ? (
          <OasisCard tone="lilac" className="agenda-empty">
            <h3 className="oasis-title">Un día libre</h3>
            <p>{active.size ? "Con estos filtros no hay nada este día. Quita alguno para ver más." : "No hay nada programado. Puede ser un buen momento para escribir una nota o soltar unas burbujas."}</p>
            <Link className="btn btn-lilac" to="/rincon">
              Ir a mi rincón
            </Link>
          </OasisCard>
        ) : (
          <ul className="agenda-list" key={dayKey(selected)}>
            {items.map((item, index) => {
              const time = clock(item.time)
              return (
                <li key={item.id}>
                  <OasisCard as="article" tone={TONE[item.type]} index={index} className="ev" data-category={item.category}>
                    <span className="ev-bar" aria-hidden="true" />
                    <div className="ev-time">
                      <strong>{time.hour}</strong>
                      <small>{time.suffix}</small>
                    </div>
                    <div className="ev-body">
                      <p className="ev-tags">
                        <span className="ev-type" data-category={item.category}>
                          <i aria-hidden="true" />
                          {categoryLabel(item.category)}
                        </span>
                        <span className="ev-type">{typeLabel(item.type)}</span>
                        {item.sample ? <span className="ev-sample">Ejemplo</span> : null}
                        {item.free ? <span className="ev-free">Gratis</span> : null}
                      </p>
                      <h3 className="oasis-title ev-title">{item.title}</h3>
                      <p className="ev-organizer">{item.organizer}</p>
                      <p className="ev-summary">{item.summary}</p>
                      <p className="ev-place">
                        <span className="ev-pin" aria-hidden="true" />
                        {item.place}
                      </p>
                      <div className="ev-actions">
                        {item.sample ? null : (
                          <a
                            className="btn btn-ghost ev-btn"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.place} Villavicencio`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Cómo llegar
                          </a>
                        )}
                        <button className="btn btn-sky ev-btn" type="button" onClick={() => download(item)}>
                          Agregar a mi calendario
                        </button>
                      </div>
                      <p className="muted ev-source">
                        {item.sourceUrl ? (
                          <>
                            Fuente:{" "}
                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                              {hostOf(item.sourceUrl)}
                            </a>
                            .{" "}
                          </>
                        ) : (
                          "Fuente: por cargar. "
                        )}
                        {item.verifiedAt ? `Verificado el ${shortDate(item.verifiedAt)}.` : "Sin verificar."}
                      </p>
                    </div>
                  </OasisCard>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
