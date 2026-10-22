# Casos TRL 4

Entorno controlado: este repositorio, datos sintéticos y escenarios ficticios. Ningún caso usa una historia clínica ni un teléfono inventado.

## 1. Interior distinto de la puerta pública

- Entrada: primera visita, sin sesión, ruta `/`.
- Esperado: página informativa, con registro y "Hablar con alguien". No hay diario ni juego.
- Luego: "Entrar sin cuenta" en `/entrar`.
- Esperado: shell con cinta "Adentro", inicio en `/inicio`, patio (sonido, burbujas, nota al futuro) y tres puertas. La ayuda sigue en la barra, sin ser la única pieza.

## 2. Distracción

- Entrada: `/rincon?pieza=distraer`.
- Esperado: lectura corta, burbujas sin puntaje y una escucha. Si Spotify o YouTube no responden, la tarjeta dice que es un ejemplo y un botón "Escuchar" genera un tono en el navegador. El enlace a hablar queda debajo, no como título.

## 3. WhatsApp como puente

- Contacto de confianza: nombre "Ana", celular `300 111 2233`. Botón "Escribirle".
- Esperado: el texto se puede editar. El enlace es `https://wa.me/573001112233?text=` más el mensaje codificado. Oasis no llama a una API de envío.
- Yo Te Escucho: el enlace usa `573163907010` y el guion de la ficha.
- Línea 106 y Línea 01 8000 931 089: no hay enlace de WhatsApp.
- El panel "Acceso rápido en esta página" dice que un chatbot necesitaría un proveedor que este prototipo no opera.

## 4. Agenda

- Entrada: `/cerca`, filtros Distracción, Bienestar y Lúdicas.
- Esperado: solo eventos con `sample: true` y la insignia Ejemplo. Cada filtro deja únicamente su categoría. Sin filtro se ve la semana de ejemplo.

## 5. Directorio y mapa

- Esperado: tres fichas con teléfono, fuente "Directorio de salud mental y prevención del suicidio, MinSalud" y fecha 19 oct 2026. Cada ficha muestra qué pasa al llamar y el guion.
- "Usar donde estoy" mueve el mapa y no escribe coordenadas en IndexedDB.
- Los puntos salvia dicen Ejemplo. No tienen teléfono.

## 6. Compañero

- Entrada: `/hablar`, con el compañero por defecto (nombre Loto, forma loto).
- Esperado: un saludo no muestra ficha. "Estoy en Bogotá y quiero llamar" muestra la Línea 106. "Me hacen domicilios?" muestra Yo Te Escucho y dice que no puede confirmar visitas. Una frase del modelo con tratamiento, medicamento o un teléfono ajeno al catálogo se descarta y queda la respuesta local.
- La ficha, cuando aparece, trae fuente y fecha. El límite dice que no diagnostica ni recomienda tratamientos.
- En `/recuerdo` se cambian el nombre, la forma (loto, isla, gota o bruma) y la nota. Eso queda en IndexedDB. No es una ficha clínica.
- Si no hay `GEMINI_API_KEY` o no hay red, la respuesta local sigue. No se afirma que Gemini funcione sin red.

## 7. Voz

- Primer toque al micrófono, y luego la frase "Oasis, abre mi rincón".
- Esperado: sin la palabra Oasis, la escucha continua no navega. Con ella, abre `/rincon`.
- En `/entrar`, una frase con correo y clave llena el formulario. El aviso no repite la clave.
- El panel dice que el navegador puede enviar el audio a su proveedor de reconocimiento. Si ese navegador no ofrece reconocimiento, el menú sigue disponible.

## 8. Menús, noche y loto

- El celular usa la grilla de abajo, la tablet el riel y el computador la barra. Cada tipo de dispositivo tiene el suyo.
- "Noche" pone `data-theme="noche"` y el botón pasa a "Día". "Letra grande" y "Lenguaje sencillo" siguen en `/recuerdo`.
- Al entrar, si hay WebGL y no está pedido menos movimiento, se abre el loto: se puede saltar, invertir la dirección de los pétalos y pasar a la versión liviana. El agua refleja los pétalos. `prefers-reduced-motion` deja una cortina corta, sin la escena 3D.
- La misma sesión del navegador no vuelve a montar el loto.

## 9. Sala y Postgres

- Sin `DATABASE_URL`: `GET /api/metrics/semilla` devuelve la semilla (40 visitas, 7 ayudas, 15 distracciones, 12 agendas, tonos 8, 11, 9, 6 y 4). El diario sigue en el navegador.
- Sin `ADMIN_PASSWORD`: `POST /api/admin/entrar` responde 503.
- Con clave y sin Postgres: entrar responde 200 y `GET /api/admin/resumen` dice que la base no está disponible.
- Con Postgres: la sala puede publicar una actividad. Aparece en la agenda como Ejemplo. El formulario no puede quitar esa marca.

## 10. Sin red

- Con la aplicación ya cargada, las fichas, los teléfonos, el guion y el botón "Hablar con alguien" se dibujan desde el paquete. No se afirma que la frase de Gemini funcione sin red.
