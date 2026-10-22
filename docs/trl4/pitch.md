# Pitch de cinco minutos

## Problema

En Villavicencio, una persona joven puede necesitar un número oficial y, al mismo tiempo, no querer entrar a un sitio que parezca consulta. Si la primera pantalla ya pide que cuente cómo está, mucha gente se va.

## Quién lo usa

Una persona joven, en su celular o en un computador del colegio. Entra sin cuenta si quiere. Lo que escribe se queda en ese navegador.

## Qué es Oasis

Por fuera, una página tranquila: qué es el espacio, cómo registrarse y la puerta para hablar con alguien.

Por dentro, otro lugar. Hay un sonido, burbujas sin puntaje, una lectura corta y una nota para abrir otro día. La marca del día es un recuerdo propio, no un diagnóstico. Cerca están la agenda de ejemplo y tres líneas con fuente y fecha. Hablar con alguien sigue ahí, como una puerta más.

## Recorrido de la demo

1. Abrir `/` sin sesión y mostrar que informa, no que acompaña todavía.
2. Entrar sin cuenta y llegar a `/inicio`: la cinta "Adentro", el patio y la marca.
3. Distraerse: soltar una burbuja y escuchar "Tarde lenta" aunque no haya llaves de música.
4. Filtrar la agenda por Lúdicas y señalar la insignia Ejemplo.
5. Abrir una ficha, leer el guion y mostrar el enlace de WhatsApp solo en Yo Te Escucho. No se envía el mensaje.
6. Preguntar "estoy en Bogotá" y ver la Línea 106 junto al límite: no diagnostica.
7. Abrir `/sala` y mostrar la semilla anónima. Decir en voz alta que no hay un perfil clínico por persona.

## Evidencia

`npm test`: 23 pruebas pasaron, 1 se omitió porque no había `DATABASE_URL`, 0 fallaron. Cubren el orientador, los tres filtros, el enlace `wa.me` y la suma de la semilla. El detalle está en `docs/trl4/evidencia.md`.

## Dónde está en TRL 4

Las funciones críticas están integradas y andan en un entorno controlado, con datos sintéticos y escenarios ficticios. No es un piloto con usuarios reales ni un servicio de salud.

## Límites, en serio

- No operamos un chatbot de WhatsApp. Haría falta un proveedor. Hoy el camino es el enlace y el guion en la página.
- No hay una ficha clínica escondida por persona. La regla del hackathon es cero datos reales, y además Oasis no diagnostica. La sala solo ve conteos sin nombre.
- La agenda y los puntos del mapa que dicen Ejemplo no son actividades ni consultorios confirmados.
- Gemini no funciona sin red ni sin llave. El teléfono y el guion sí viajan con la aplicación.
- Postgres es para operaciones anónimas. Si está apagado, el espacio personal sigue en el dispositivo.

## Siguiente paso

Que una persona de la entidad revise los teléfonos contra el directorio de MinSalud en cada periodo, y que un colegio use la sala solo para proponer actividades de ejemplo hasta que alguien las confirme con fuente y fecha.
