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

## 6. Orientador

- "Estoy en Bogotá" -> Línea 106.
- "Quiero la línea gratuita" -> Línea 01 8000 931 089.
- "Estoy en Villavicencio" -> Yo Te Escucho.
- En todos los casos se lee el límite: no es un profesional, no diagnostica ni recomienda tratamientos. Si no hay red, no se pide frase a Gemini.

## 7. Sala y Postgres

- Sin `DATABASE_URL`: `GET /api/metrics/semilla` devuelve la semilla (40 visitas, 7 ayudas, 15 distracciones, 12 agendas, tonos 8, 11, 9, 6 y 4). El diario sigue en el navegador.
- Sin `ADMIN_PASSWORD`: `POST /api/admin/entrar` responde 503.
- Con clave y sin Postgres: entrar responde 200 y `GET /api/admin/resumen` dice que la base no está disponible.
- Con Postgres: la sala puede publicar una actividad. Aparece en la agenda como Ejemplo. El formulario no puede quitar esa marca.

## 8. Noche, letra y movimiento

- "Noche" oscurece la misma paleta. "Letra grande" y "Lenguaje sencillo" siguen en `/recuerdo`. `prefers-reduced-motion` sigue apagando animaciones.

## 9. Sin red

- Con la aplicación ya cargada, las fichas, los teléfonos, el guion y el botón "Hablar con alguien" se dibujan desde el paquete. No se afirma que la frase de Gemini funcione sin red.
