# Declaración

## Trabajo previo en este repositorio

La base ya estaba antes de esta iteración. El changelog `0.1.0` (22 oct 2026) describe la página pública, la entrada, el shell, la marca del día, el diario, la cápsula, hasta dos contactos, la voz, Dexie, el directorio con fuente y fecha, el orientador, la agenda de ejemplo, el `.ics`, las playlists, la PWA con Workbox, Docker y el servicio en Render.

Esta iteración no reescribió esa base. Añadió el interior como espacio distinto, la distracción utilizable sin llaves, el enlace `wa.me`, los filtros Distracción, Bienestar y Lúdicas, los puntos de ejemplo del mapa, la sala anónima, Postgres opcional, el modo noche y las pruebas de reglas.

## Herramientas de esta iteración

- Editor Cursor, con el agente de código.
- Node.js y el corredor `node:test` mediante `tsx` (`npm test`).
- Vite, para la interfaz en desarrollo.
- El navegador integrado, para recorrer la puerta pública, el interior, la distracción, los filtros, el guion y la sala.
- No se desplegó de nuevo a Render en este paso.

## Terceros

Las licencias salen del campo `license` de cada `package.json` instalado. El repositorio Oasis no tiene archivo `LICENSE` propio.

| Pieza | Licencia declarada |
| --- | --- |
| react, react-dom | MIT |
| react-router-dom | MIT |
| vite, @vitejs/plugin-react, vite-plugin-pwa | MIT |
| hono, @hono/node-server | MIT |
| dexie | Apache-2.0 |
| leaflet, dotenv | BSD-2-Clause |
| react-leaflet | Hippocratic-2.1 |
| three, @react-three/fiber, @react-three/drei | MIT |
| pg, esbuild, tsx | MIT |
| typescript, @types/* | MIT, salvo typescript (Apache-2.0) |
| @fontsource/fraunces, @fontsource/nunito | OFL-1.1 |

Workbox entra a través de `vite-plugin-pwa` y precachea el shell. El mapa usa teselas de OpenStreetMap, con la atribución que ya muestra Leaflet. Spotify, YouTube, Gemini y Google Identity son servicios opcionales: si faltan las llaves, la experiencia local sigue.

No hay API de WhatsApp Business. El puente es un enlace `wa.me` armado en el navegador.
