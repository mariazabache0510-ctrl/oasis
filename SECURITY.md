# Seguridad

Oasis es un prototipo académico. Esta nota describe qué protege hoy, qué queda en el dispositivo y qué no hay que pedirle.

## Alcance

El objetivo es no sacar del navegador el diario, las cápsulas, la marca del día, los contactos de confianza ni la contraseña. El servidor publica catálogos, puede sumar conteos anónimos y, si hay llaves, consulta Spotify, YouTube o Gemini.

No es un servicio clínico. No hay historia clínica, no hay profesionales asignados y el orientador dice en cada respuesta que no diagnostica ni recomienda tratamientos.

La idea de un perfil clínico oculto por persona queda rechazada. Choca con "cero datos reales" y con "no diagnosticar". La sala no recibe diarios, nombres, correos ni un diagnóstico. Solo ve sumas: visitas, marcas por tono, usos de ayuda, usos de distracción y aperturas de agenda.

## Datos que se quedan en el dispositivo

IndexedDB (`oasis`) guarda el perfil, las marcas, las notas, las cápsulas y hasta dos contactos. Salir de la sesión no borra esa base. Borrar los datos del sitio en el navegador, o usar la acción de vaciar el espacio, sí la elimina.

Quien tenga el perfil del navegador desbloqueado puede leer esa base con las herramientas del propio navegador. El cifrado de la contraseña no cifra el diario.

La ubicación de Cerca se pide solo al pulsar "Usar donde estoy". Se usa para mover el mapa en ese momento y no se envía a la API ni se escribe en IndexedDB. Los puntos marcados Ejemplo son coordenadas fijas de ficción, no sedes reales.

La navegación por voz usa el reconocimiento del navegador. Oasis compara el texto en el dispositivo y no lo manda a su servidor. Según el navegador, el audio puede ir al proveedor de ese reconocimiento. Si esa salida no es aceptable, las mismas secciones están en la barra.

## Cuenta local

Hay una sola cuenta por navegador.

- La sal son 16 bytes de `crypto.getRandomValues`.
- La contraseña se deriva con PBKDF2-SHA-256, 150000 iteraciones y 256 bits.
- La comparación del hash no se detiene en el primer byte distinto.
- La contraseña en claro no se escribe en la base ni se envía a Oasis.
- Hace falta un contexto seguro (`https` o `localhost`) porque la derivación usa `crypto.subtle`.

Eso dificulta adivinar la clave a partir del hash. No convierte el navegador en un almacén sellado, y no permite recuperar la cuenta en otro dispositivo.

## Google

Si `VITE_GOOGLE_CLIENT_ID` existe al compilar, la entrada muestra el botón de Google Identity Services. El navegador lee el nombre y el correo del payload del credential y los guarda en el perfil local.

Ese payload no se verifica en un servidor de Oasis. Cualquiera que altere el objeto en su propio navegador puede escribir un nombre en su propia base local. No abre datos de otra persona, porque no hay cuentas centrales. Tampoco demuestra, fuera de ese navegador, que Google autenticó a esa persona.

El identificador de cliente es público por diseño. No es una llave secreta y no debe tratarse como `GEMINI_API_KEY` o el secreto de Spotify.

## API

Las rutas `/api` no piden sesión ni token.

| Superficie | Efecto |
| --- | --- |
| Directorio, agenda y salud | Lectura de datos ya publicados en el repositorio. |
| Playlists | El servidor llama a Spotify o YouTube con las llaves y devuelve nombre, portada y URL de inserción. No devuelve la llave. |
| Orientador | Recibe un texto, lo recorta a 280 caracteres para el modelo y elige una ficha por reglas. No lo guarda. |
| `POST /api/events` | Suma un conteo permitido. Un tipo desconocido responde 400. Un tono que no sea luminoso, calma, regular, bajito o pesado se descarta. No se guarda el texto de un diario. |
| `/api/admin` | Exige `ADMIN_PASSWORD` y un token de ese proceso. Publicar una actividad la fuerza como ejemplo. |
| WhatsApp | El navegador abre `https://wa.me/` con un texto que la persona puede editar. No hay API de WhatsApp Business ni envío desde el servidor. |

No hay límite de frecuencia. Un cliente puede incrementar los contadores o llamar al orientador tantas veces como el proceso aguante. En el plan gratuito de Render el proceso es uno solo y se reinicia al desplegar.

La frase de Gemini se descarta si viene vacía, si la llamada falla o si contiene términos de diagnóstico, tratamiento, medicamento, dosis o suicidio. El filtro es una red de apoyo, no una garantía. La ficha oficial y su límite siguen en la respuesta aunque la frase se descarte.

## Secretos

`.env` y `.env.local` están en `.gitignore`. `.env.example` no trae valores.

| Secreto | Dónde puede existir |
| --- | --- |
| `SPOTIFY_CLIENT_SECRET` | Entorno del servidor o del contenedor. |
| `YOUTUBE_API_KEY` | Entorno del servidor o del contenedor. |
| `GEMINI_API_KEY` | Entorno del servidor o del contenedor. |
| `ADMIN_PASSWORD` | Entorno del servidor o del contenedor. Vacía en `.env.example`. |
| `DATABASE_URL` | Entorno del servidor. La base local de compose usa la clave `oasis_local`, solo para conteos anónimos en `127.0.0.1`. No es una clave de producción. |

No van en argumentos de `docker build`. Esos argumentos quedan en el historial de la imagen. `VITE_GOOGLE_CLIENT_ID` sí es un argumento de build, porque el navegador tiene que recibirlo dentro del JavaScript.

`.dockerignore` excluye `.env` para que un build local no lo copie al contexto.

## Contenedor y hosting

- La imagen final corre como el usuario de sistema `oasis`, no como root.
- El proceso escucha en todas las interfaces y en `PORT`, que el compose fija en 3000 y Render inyecta.
- El chequeo del contenedor pide `GET /api/health`.
- Render termina TLS en el borde. La aplicación habla HTTP detrás de ese proxy.
- El disco de Render no es un lugar para guardar diarios. El diseño no lo hace.
- El service worker cachea estáticos. HTML, `sw.js` y `registerSW.js` se envían con `Cache-Control: no-cache`.

## Qué no hace este prototipo

- No verifica el token de Google en un servidor.
- No cifra el diario en reposo.
- No ofrece recuperación de cuenta ni sincronización entre dispositivos.
- No limita el ritmo de la API.
- No guarda un registro de auditoría de las llamadas.
- No sustituye a la Línea 106, a Yo Te Escucho Villavicencio ni a la Línea 01 8000 931 089.
- No opera un chatbot de WhatsApp.
- No guarda un perfil clínico por persona.
- No presenta como reales los eventos ni los puntos marcados Ejemplo.
- No hace funcionar a Gemini sin red.

## Cómo avisar de un problema

Abre un aviso privado de seguridad en el repositorio de GitHub, o un issue si el hallazgo no incluye llaves, datos de una persona ni un procedimiento de abuso. No pegues `.env` ni tokens en el issue.
