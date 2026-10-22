# Declaración

## Trabajo previo en este repositorio

La base ya estaba antes de esta iteración. El changelog `0.1.0` (22 oct 2026) describe la página pública, la entrada, el shell, la marca del día, el diario, la cápsula, hasta dos contactos, la voz, Dexie, el directorio con fuente y fecha, el orientador, la agenda de ejemplo, el `.ics`, las playlists, la PWA con Workbox, Docker y el servicio en Render.

La iteración siguiente no reescribió esa base. Añadió el interior como espacio distinto, la distracción utilizable sin llaves, el enlace `wa.me`, los filtros Distracción, Bienestar y Lúdicas, los puntos de ejemplo del mapa, la sala anónima, Postgres opcional, el modo noche y las pruebas de reglas.

El commit `a8e0a99`, ya en `main`, añadió el compañero, la palabra Oasis, los tres menús, la apertura del loto con Three.js y GSAP, la marca propia en el favicon y en los iconos, y la versión 2 de IndexedDB. Sacó la carpeta de referencia `Loto` de la raíz y dejó el alias `@modules` del cliente en `paths`, sin `baseUrl`. Esta pasada de documentación no desplegó a Render.

## Herramientas de esta iteración

- Editor Cursor, con el agente de código.
- Node.js v24.12.0 y el corredor `node:test` mediante `tsx` (`npm test`, 22 oct 2026: 33 en verde, 1 omitida sin `DATABASE_URL`, 0 fallos).
- Vite, para la interfaz en desarrollo.
- No se recorrió de nuevo el navegador en esta pasada de documentación.
- No se desplegó de nuevo a Render en este paso.

## Terceros

El material original de Oasis está reservado en [LICENSE](../../LICENSE): Darwin Joan Aveiga Mora, Mariana Sofia Azabache Moreno y Julian Esteban Chavez Zamora, todos los derechos reservados. `package.json` declara `UNLICENSED`. Las licencias de las dependencias salen del campo `license` de cada `package.json` instalado.

| Pieza | Licencia declarada |
| --- | --- |
| react, react-dom | MIT |
| react-router-dom | MIT |
| vite, @vitejs/plugin-react, vite-plugin-pwa | MIT |
| hono, @hono/node-server | MIT |
| dexie | Apache-2.0 |
| leaflet, dotenv | BSD-2-Clause |
| react-leaflet | Hippocratic-2.1 |
| three, @react-three/fiber, @react-three/drei, @react-three/postprocessing | MIT |
| postprocessing | Zlib |
| gsap | Standard 'no charge' license: https://gsap.com/standard-license. |
| pg, esbuild, tsx | MIT |
| typescript, @types/* | MIT, salvo typescript (Apache-2.0) |
| @fontsource/fraunces, @fontsource/nunito | OFL-1.1 |

Workbox entra a través de `vite-plugin-pwa` y precachea el shell. El manifiesto pide `display: standalone`. El mapa usa teselas de OpenStreetMap, con la atribución que ya muestra Leaflet. Spotify, YouTube, Gemini y Google Identity son servicios opcionales: si faltan las llaves, la experiencia local sigue. La apertura del loto usa Three.js y GSAP. GSAP no está bajo MIT: su `package.json` declara la licencia estándar sin cargo de GreenSock.

No hay API de WhatsApp Business. El puente es un enlace `wa.me` armado en el navegador.
