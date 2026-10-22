# Changelog

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las fechas usan el calendario del repositorio. Oasis todavía no tiene etiquetas de versión. `0.1.0` reúne el prototipo publicado el 22 oct 2026.

## [Sin publicar]

### Añadido

- Compañero en `/hablar`: chat, ficha oficial con fuente y fecha, y configuración en `/recuerdo` (nombre, forma loto, isla, gota o bruma, y nota). Gemini es opcional y no sustituye a la ficha.
- Palabra de activación Oasis después del primer toque al micrófono. En la entrada, la voz puede llenar el formulario. El aviso no repite la clave.
- Tres menús: grilla en el celular, riel en la tablet y barra en el computador.
- Apertura del loto con Three.js y GSAP: saltar, invertir los pétalos, reflejo en el agua y versión liviana. La carpeta de referencia `Loto` ya no está en la raíz.
- Marca propia del loto en el favicon, en los iconos de la PWA y en el manifiesto `standalone`.
- Modo noche por tokens (`html[data-theme="noche"]`).
- Interior distinto de la puerta pública: patio, distracción con lectura, burbujas sin puntaje y escucha de ejemplo si faltan las playlists.
- Enlace `wa.me` editable para un contacto de confianza y para Yo Te Escucho. Panel de acceso rápido que no simula un chatbot.
- Agenda filtrable por Distracción, Bienestar y Lúdicas. Los eventos siguen marcados como ejemplo.
- Puntos de mapa ficticios, separados de las tres fichas oficiales. Guion visible y aviso copiable si un teléfono no contesta.
- Orientador con motivo de la ficha elegida y el mismo límite humano.
- Postgres opcional en Compose para conteos anónimos y actividades de ejemplo. Sala `/sala` con `ADMIN_PASSWORD`. Sin base, sigue la semilla sintética y el espacio en el navegador.
- Pruebas de reglas, filtros, WhatsApp, semilla, compañero, palabra Oasis y dirección de los pétalos. Notas de TRL 4 en `docs/trl4`.
- Imagen Docker en dos etapas, con usuario `oasis`, chequeo de `/api/health` y `docker-compose.yml`.
- `.dockerignore` para dejar fuera dependencias, artefactos y `.env`.
- `README.md`, `ARCHITECTURE.md`, `SECURITY.md` y este changelog.
- Láminas en `docs/assets` con la paleta crema, salvia, durazno, lila, cielo y mantequilla.

### Cambiado

- Dexie `oasis` pasa a la versión 2 y guarda el chat, con las 40 líneas más recientes.
- `POST /api/companion` responde en el servidor. `GET /api/health` incluye `ops`.
- `client/tsconfig.json` resuelve `@modules` con `paths` y sin `baseUrl`.
- La voz del shell espera la palabra Oasis. El botón Escuchar de la entrada no volvió.

## [0.1.0] - 2026-10-22

### Añadido

- Espacio pastel para llegar a las rutas de apoyo de Villavicencio, con página pública en la primera visita y secciones después de entrar.
- Entrada con registro local, ingreso, Google y continuar sin cuenta. Fondo de burbujas, isla 3D y detección de computador, tablet o celular.
- Inicio con marca del día, tarjetas y hojas.
- Cerca con fichas de líneas, fuente y fecha, mapa, agenda semanal y descarga `.ics`. Los eventos sin confirmar se marcan como ejemplo.
- Mi rincón con diario, distracción, cápsula para una fecha posterior y marca.
- Hablar con alguien: qué va a pasar, una frase para leer y el número. El orientador elige una línea y, si hay llave, pide una frase corta.
- Lo que recuerdo de ti: conteos locales, tamaño de letra y lenguaje sencillo.
- Navegación por voz entre Inicio, Cerca, Rincón, Hablar y Recuerdo.
- Datos personales en IndexedDB de este navegador. La contraseña local se guarda solo como hash PBKDF2.
- API Hono para salud, directorio, playlists, orientador y conteos anónimos en memoria.
- Aplicación instalable con Workbox.
- Publicación del servicio `oasis` en Render, en `https://oasis-hiu0.onrender.com`.

### Cambiado

- La entrada dejó de ofrecer un botón Escuchar. La voz pasó al shell de las secciones, como navegación.
- La agenda dejó de depender de la zona horaria del servidor: la semana se ancla en el día que envía quien pregunta.

[Sin publicar]: https://github.com/mariazabache0510-ctrl/oasis/compare/main...HEAD
[0.1.0]: https://github.com/mariazabache0510-ctrl/oasis/commits/main
