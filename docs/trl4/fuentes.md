# Fuentes

Consulta de los teléfonos oficiales: 19 oct 2026.
Fuente: Directorio de salud mental y prevención del suicidio, MinSalud.

No se agregó ningún teléfono que no estuviera ya en `src/modules/directory/catalog.ts`.

## Canales verificados en el catálogo

| Ficha | Teléfono | WhatsApp en el catálogo | Horario |
| --- | --- | --- | --- |
| Yo Te Escucho Villavicencio | 316 390 7010 | 573163907010 | 24 horas, todos los días |
| Línea 106 | 106 | no tiene | 24 horas, todos los días |
| Línea 01 8000 931 089 | 01 8000 931 089 | no tiene | Según el directorio consultado |

Cada ficha repite la fuente y la fecha dentro de la interfaz. El chat del compañero no agrega teléfonos: si la pregunta pide ayuda, muestra una de estas fichas, con la misma fuente y la misma fecha.

## Ficción, marcada como ejemplo

No son actividades confirmadas ni lugares de atención.

Agenda de ejemplo en `src/modules/events/catalog.ts`:

- Pausas activas en el parque. Lúdicas.
- Taller para bajar el estrés. Bienestar.
- Charla de autocuidado. Bienestar.
- Taller de pintura libre. Distracción.
- Círculo de escucha. Bienestar.

Si Postgres arranca vacío, también siembra tres actividades de ejemplo: tarde de juegos en el patio, círculo de respiración y lectura en voz baja. Siguen con `sample: true` hasta que una persona las confirme fuera del formulario.

Mapa, en `examplePoints`:

- Parque de ejemplo.
- Biblioteca de ejemplo.

La semilla de métricas (40 visitas, tonos 8 / 11 / 9 / 6 / 4, 7 ayudas, 15 distracciones, 12 agendas) es sintética. No sale de personas reales.

La escucha "Lluvia en el patio", "Tarde lenta" y "Ventana abierta" es un tono generado en el navegador cuando no hay playlist.
