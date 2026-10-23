<p align="center">
  <img src="docs/assets/hero.svg" alt="Oasis. Un espacio tuyo para llegar a las rutas de apoyo en Villavicencio." width="960">
</p>

Oasis es un prototipo académico para Villavicencio. Por fuera informa y deja entrar. Por dentro es un lugar para quedarse: un sonido, un juego sin puntaje, una nota para después, un compañero con el que se puede escribir y una marca del día que no es un diagnóstico. Las líneas oficiales siguen a un lado, con fuente y fecha. No diagnostica, no atiende y no es un servicio de salud.

La versión publicada está en [oasis-hiu0.onrender.com](https://oasis-hiu0.onrender.com).

## Secciones

<p align="center">
  <img src="docs/assets/sections.svg" alt="Seis tarjetas: Llegar, Hoy, Líneas, Quedarse, Llamar y Tuyo." width="960">
</p>

| Ruta | Quién entra | Qué guarda o muestra |
| --- | --- | --- |
| `/` | Cualquier persona | Página pública. El botón dice Registrarse, o Entrar si este navegador ya tuvo una sesión. |
| `/entrar` | Cualquier persona | Registro local, ingreso, Google si hay identificador, o continuar sin cuenta. Cada ingreso abre el loto si hay WebGL y el movimiento está permitido. En el celular esa escena ocupa toda la pantalla, con Saltar y Volver. |
| `/inicio` | Sesión abierta | El patio: sonido, burbujas, nota al futuro, marca y tres puertas. |
| `/cerca` | Sesión abierta | Fichas con guion, mapa y agenda filtrable. |
| `/rincon` | Sesión abierta | Diario, distracción, cápsula y marca. |
| `/hablar` | Sesión abierta | Chat con el compañero y, si la pregunta pide ayuda, la ficha oficial con fuente y fecha. También el enlace de WhatsApp si el catálogo ya lo trae. |
| `/recuerdo` | Sesión abierta | Nombre, forma y nota del compañero. Resumen local, tamaño de letra, lenguaje sencillo y modo noche. |
| `/sala` | Clave de colegio, aparte de la sesión personal | Conteos anónimos y publicación de actividades de ejemplo. |

La página pública informa. Un celular real tiene su propia grilla, también en la entrada y en el interior: Inicio, Cerca, Rincón y Hablar, y según la pantalla Tuyo, Ayuda, Noche, Salir y Voz. La tablet conserva el riel y el computador la barra. La detección trata como celular un Android sin la palabra Mobile si la pantalla es chica, un iPhone en sitio de escritorio (agente Macintosh con toque y pantalla corta) y un puntero grueso con ventana chica. El inicio y las secciones son el espacio vivido: la distracción va primero y hablar con alguien es una puerta más. El registro activa el diario, la cápsula, los contactos, el compañero y la voz.

## Tecnologías

<p align="center">
  <img src="docs/assets/stack.svg" alt="Tarjetas pastel de React, TypeScript, Vite, Hono, Node.js, Dexie, React Router, Three.js, Leaflet, PWA y Docker." width="960">
</p>

| Pieza | Papel en Oasis |
| --- | --- |
| React 19 | Páginas, entrada y shell. |
| TypeScript | Contrato compartido entre la interfaz y la API. |
| Vite 7 | Servidor de desarrollo y paquete de producción. |
| Hono | Rutas `/api` sobre Node. |
| Node.js 22 | Proceso que escucha en `0.0.0.0` y en el puerto `PORT`. |
| Dexie | IndexedDB de este navegador. El diario no sale de ahí. |
| PostgreSQL 16 | Opcional, en Docker. Solo conteos anónimos y actividades de ejemplo. Si no arranca, el espacio personal sigue. |
| React Router 7 | Rutas de la aplicación y comandos de voz. |
| Three.js y React Three Fiber | Isla de la entrada y apertura del loto. Si esa escena falla, la entrada sigue usable. |
| GSAP | Reloj de la apertura del loto. |
| Leaflet y OpenStreetMap | Mapa de Cerca. El punto de ubicación no se guarda. |
| vite-plugin-pwa y Workbox | Aplicación instalable. El manifiesto usa `standalone`. El favicon y los iconos son el loto propio. |
| Docker | Imagen de producción en dos etapas. Compose también levanta Postgres 16. |

La paleta del producto es crema `#fbf6ee`, salvia `#c9dcc8`, durazno `#f6cdb6`, lila `#e4d4f4`, cielo `#c9e4f5` y mantequilla `#f8e7b0`, con tinta `#3d3a46`. Los títulos usan Fraunces y el texto Nunito. El modo noche, con `html[data-theme="noche"]`, oscurece fondo, tinta y tarjetas. Si el sistema pide oscuro y todavía no hay una preferencia guardada, la primera carga usa noche.

## Arranque local

Hace falta Node.js 20.19 o superior. El desarrollo usa dos procesos: la API en el puerto 3000 y Vite, que reenvía `/api` hacia esa API.

```bash
npm ci
npm run dev
npm run dev:web
```

La compilación que usa Render y Docker se prueba así:

```bash
npm run build
npm start
```

Queda en [http://127.0.0.1:3000](http://127.0.0.1:3000). `GET /api/health` responde `ok: true` y `ops`: `sin-configurar` si no hay `DATABASE_URL`, `postgres` si la base responde, o `no-disponible` si la URL existe y la base no contesta.

Las pruebas cubren playlists, la agenda y sus tres filtros, el orientador, el enlace de WhatsApp, la semilla de métricas, los comandos de voz, la palabra Oasis, el llenado hablado del formulario, las respuestas locales del compañero, la dirección de los pétalos y la clasificación de celular, tablet y computador. Si no hay `DATABASE_URL`, la prueba de Postgres se omite:

```bash
npm test
```

## Docker

La imagen copia solo el servidor ya empaquetado, la interfaz construida y las dependencias de ejecución. El proceso corre como el usuario `oasis` y escucha en el puerto 3000.

```bash
docker compose build
docker compose up
```

`HOST_PORT` cambia el puerto publicado en la máquina. `VITE_GOOGLE_CLIENT_ID` se hornea en la imagen durante el build, porque Vite lo necesita al compilar. Las llaves de Spotify, YouTube y Gemini se leen al arrancar y pueden vivir en el entorno o en un archivo `.env` junto al compose, sin entrar en la imagen.

Compose también levanta Postgres 16. La clave `oasis_local` solo sirve para esa base local de conteos anónimos, publicada en `127.0.0.1:5432`. Dentro de la red del compose la aplicación usa `DATABASE_URL=postgresql://oasis:oasis_local@postgres:5432/oasis`. `ADMIN_PASSWORD` no tiene valor por defecto: hay que pasarla en el entorno para entrar a la sala. Si Postgres no responde, el contenedor de Oasis igual puede atender el espacio personal.

```bash
docker compose build --build-arg VITE_GOOGLE_CLIENT_ID=tu-identificador-publico
docker compose up
```

## Variables

Copia `.env.example` a `.env`. El archivo real está en `.gitignore`. Si faltan, Oasis sigue funcionando: las playlists se ocultan, el compañero y el orientador se quedan con la frase local, y el botón de Google no aparece.

| Variable | Cuándo se lee | Uso |
| --- | --- | --- |
| `SPOTIFY_CLIENT_ID` | Arranque | Credencial de la API de Spotify. |
| `SPOTIFY_CLIENT_SECRET` | Arranque | Secreto de Spotify. Solo en el servidor. |
| `SPOTIFY_PLAYLIST_ID` | Arranque | Id o URL pública de la playlist. |
| `YOUTUBE_API_KEY` | Arranque | Clave de la API de YouTube. |
| `YOUTUBE_PLAYLIST_ID` | Arranque | Id o URL de la playlist. |
| `GEMINI_API_KEY` | Arranque | Frase opcional del compañero y del orientador. Si falta, queda la respuesta local. |
| `GEMINI_MODEL` | Arranque | Por defecto `gemini-2.0-flash`. |
| `VITE_GOOGLE_CLIENT_ID` | Build de Vite | Botón de Google. Identificador público. |
| `PORT` | Arranque | Puerto HTTP. Por defecto 3000. Render lo inyecta. |
| `DATABASE_URL` | Arranque | Postgres de conteos anónimos y actividades de ejemplo. Vacío: la sala muestra la semilla. |
| `ADMIN_PASSWORD` | Arranque | Clave de `/sala`. Vacío: no se publica ni se lee la base en vivo. No va en el código. |

## Documentación

| Documento | Contenido |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Módulos, datos, API y construcción. |
| [SECURITY.md](SECURITY.md) | Qué se guarda, qué no sale del dispositivo y límites del prototipo. |
| [CHANGELOG.md](CHANGELOG.md) | Historia del prototipo. |
| [docs/trl4/casos.md](docs/trl4/casos.md) | Escenarios de las funciones críticas. |
| [docs/trl4/evidencia.md](docs/trl4/evidencia.md) | Salida real de las pruebas. |
| [docs/trl4/fuentes.md](docs/trl4/fuentes.md) | Teléfonos con fuente y lo que es ficción. |
| [docs/trl4/operacion.md](docs/trl4/operacion.md) | Quién verifica y cómo se reporta un canal caído. |
| [docs/trl4/declaracion.md](docs/trl4/declaracion.md) | Trabajo previo, herramientas y licencias. |
| [LICENSE](LICENSE) | Propiedad de los autores. Todos los derechos reservados. |

Prototipo académico. No es un servicio de salud. El material original de este repositorio es propiedad de Darwin Joan Aveiga Mora, Mariana Sofia Azabache Moreno y Julian Esteban Chavez Zamora. No se concede licencia de uso, copia ni modificación. Las dependencias de terceros conservan su propia licencia. Las líneas citan el Directorio de salud mental y prevención del suicidio de MinSalud, consultado el 19 oct 2026. La agenda marca como ejemplo todo evento que todavía no tiene fuente confirmada.
