# Evidencia

Fecha de la corrida: 22 oct 2026. Máquina de desarrollo, Windows, Node v24.12.0.

## npm test

Comando: `npm test`

Resultado real del corredor `node:test`:

```
ℹ tests 24
ℹ suites 0
ℹ pass 23
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 7674.5844
```

La primera corrida, sin `DATABASE_URL`, dejó 23 pruebas en verde y 1 omitida: `postgres guarda un conteo anónimo cuando DATABASE_URL existe`, motivo `DATABASE_URL ausente: la experiencia local no depende de esta prueba`.

Después de levantar Postgres con `docker compose up -d postgres` y exportar `DATABASE_URL` solo en el proceso, la misma orden `npm test` dejó:

```
ℹ tests 24
ℹ suites 0
ℹ pass 24
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7620.9278
```

Esa corrida incluyó la prueba de integración. No se imprimió la cadena de conexión.

Pasaron, entre otras:

- Filtros Distracción, Bienestar y Lúdicas, y la actividad publicada queda como ejemplo.
- Orientador: Bogotá a la Línea 106, línea gratuita a 01 8000 931 089, Villavicencio a Yo Te Escucho, límite sin lenguaje clínico.
- `wa.me` para un celular de 10 dígitos, sin duplicar el 57, y null para 106 y para 01 8000 931 089.
- Semilla: 40 visitas, 7 ayudas, 15 distracciones, 12 agendas, tonos 8, 11, 9, 6 y 4. Un tono ajeno no entra.
- Playlists y comandos de voz, que ya existían.

`npx tsc --noEmit -p tsconfig.json` terminó sin errores.

## API en local

El puerto 3000 ya estaba ocupado. No se detuvo ese proceso. La API de esta verificación escuchó en `http://127.0.0.1:3010` con `npm run dev`. `ADMIN_PASSWORD` se definió solo en el proceso y no se escribió en `.env`. `DATABASE_URL` se dejó vacío.

Respuestas reales:

- `GET /api/health` -> `{"ok":true,"ops":"sin-configurar"}`.
- `GET /api/metrics/semilla` -> source `sintetica`, visitas 40, ayudas 7, distracción 15, agenda 12, tonos luminoso 8, calma 11, regular 9, bajito 6, pesado 4.
- `POST /api/admin/entrar` con una clave distinta -> HTTP 401.
- `POST /api/admin/entrar` con la clave del proceso -> `ok: true` y un token de 48 caracteres. El token no se copia aquí.
- `GET /api/admin/resumen` con ese token -> source `no-disponible` y la nota "Postgres no responde. La semilla sintética sigue en la otra tarjeta. No hay perfiles de personas."
- `POST /api/admin/actividades` con el token -> HTTP 503 y "Postgres no está disponible. No se publicó. La agenda de ejemplos sigue visible."
- `GET /api/events/agenda?today=2026-10-22` -> 5 eventos, `sample: true`, categorías `ludica,bienestar,bienestar,distraccion,bienestar`.
- `POST /api/orientador` con "Estoy en Bogota" -> servicio `linea-106`.

## Navegador

Vite en `http://localhost:5173`, con el proxy hacia el puerto 3010.

- `/` mostró la página pública: "Qué bueno que estés aquí", registro y los tres teléfonos. No era el patio.
- "Entrar sin cuenta" abrió `/inicio` con la cinta "Adentro hay música...", "Este lugar es tuyo" y las tarjetas Un sonido, Burbujas y Nota al futuro.
- "Noche" pasó el botón a "Día" con estado pulsado.
- `/rincon?pieza=distraer` mostró la lectura, las burbujas sin puntaje y la escucha de ejemplo. Al soltar una burbuja quedó una menos. "Tarde lenta" pasó a "Sonando" y el aviso dijo "Se genera en este navegador."
- `/cerca` mostró los tres teléfonos, los guiones, la fuente del 19 oct 2026 y un solo enlace `wa.me` (Yo Te Escucho, número `573163907010` y el guion codificado). La 106 y la 01 8000 no tenían enlace de WhatsApp. El mapa decía Ejemplo en los puntos ficticios.
- El filtro Lúdicas, en el martes 20, dejó "Pausas activas en el parque" con la insignia Ejemplo.
- En `/hablar`, la pregunta "Estoy en Bogotá..." cambió la ficha a Línea 106 y dejó visible el límite "No diagnostico". El panel de acceso rápido dijo que un chatbot necesitaría un proveedor que el prototipo no opera.
- Un contacto "Ana" con celular `300 111 2233` armó `https://wa.me/573001112233?text=Hola.%20Soy%20yo...` dentro de un cuadro editable. No se abrió WhatsApp ni se envió el mensaje.
- `/sala` mostró 40, 7, 15, 12 y los tonos 8, 11, 9, 6 y 4, con la frase de que no son visitas reales. Tras entrar, publicar una actividad respondió en la página que Postgres no está disponible.

## Postgres encendido

`docker compose up -d postgres` dejó el servicio aceptando conexiones. Se reinició solo la API del puerto 3010 con `DATABASE_URL` en el proceso, apuntando a ese Postgres local. No se tocó el proceso que ya ocupaba el puerto 3000.

- `GET /api/health` -> `{"ok":true,"ops":"postgres"}`.
- La agenda del 22 oct 2026 pasó de 5 a 8 eventos de ejemplo e incluyó `semilla-juegos`, `semilla-respiracion` y `semilla-lectura`, todos con `sample: true` y título con prefijo `Ejemplo:`.
- `POST /api/admin/actividades` respondió 200. El evento volvió con `sample: true` y título `Ejemplo: Tarde de juegos publicada`.
- En el navegador, el viernes 23 mostró ese título junto a `Ejemplo: Lectura en voz baja`. El jueves mostró `Ejemplo: Círculo de respiración`.
- Tras entrar de nuevo a `/sala`, la tarjeta "Cifras de la base" dijo "Base anónima" y mostró 41 visitas, 7 ayudas, 15 distracciones, 14 aperturas de agenda y los mismos tonos 8, 11, 9, 6 y 4. La visita de más y las dos aperturas de agenda salen de esta misma verificación (la prueba de integración y las visitas a la agenda). La nota dice que son agregados anónimos, sin nombres, diarios ni diagnósticos.

## Sin red

En esta corrida el directorio, el guion y el botón "Hablar con alguien" salieron del paquete de la interfaz: la ficha se dibujó sin esperar una frase de Gemini, y el aviso lo dice. No se afirma que el modelo funcione sin conexión. El service worker de Workbox sigue configurado para precachear el shell; esta verificación usó el servidor de Vite, que no instala ese worker en desarrollo.
