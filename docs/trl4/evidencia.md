# Evidencia

Fecha de la corrida: 22 oct 2026. Máquina de desarrollo, Windows, Node v24.12.0.

Esta nota solo deja lo que `npm test` imprimió en esa corrida. No se repitieron las llamadas HTTP ni el recorrido en el navegador, así que no hay cifras de esa otra verificación.

## npm test

Comando: `npm test`

`DATABASE_URL` no estaba definida en el proceso. Resultado real del corredor `node:test`:

```
ℹ tests 34
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 10984.0275
```

La prueba omitida fue `postgres guarda un conteo anónimo cuando DATABASE_URL existe`, con el motivo `DATABASE_URL ausente: la experiencia local no depende de esta prueba`.

Pasaron, con estos títulos:

- Por defecto los pétalos abren desde el centro. La dirección se puede invertir.
- La palabra Oasis despierta y deja el resto. Sin esa palabra no navega en escucha continua. El botón sigue entendiendo el comando directo.
- En la entrada llena correo y clave sin devolver la clave en el aviso.
- Normaliza tildes, mayúsculas y signos. Entiende cada destino con la palabra sola y con frases completas. No inventa destinos.
- Un celular de 10 dígitos abre `wa.me` con el indicativo 57. Un número que ya trae 57 no se duplica. La línea 106 y la línea gratuita no se convierten en WhatsApp. Solo Yo Te Escucho arma el enlace con su guion.
- Una pregunta de domicilio muestra la ficha y no inventa visitas. Un saludo no arrastra la ficha oficial. Otra ciudad sigue yendo a la Línea 106. Una frase clínica del modelo se descarta.
- Hay de 4 a 6 eventos de ejemplo, todos marcados como ejemplo. Caen de lunes a domingo. Los filtros Distracción, Bienestar y Lúdicas los separan. Una actividad publicada queda como ejemplo. El `.ics` de un ejemplo lo dice en el título.
- La semilla sintética suma visitas, tonos, ayuda, distracción y agenda. Un tono desconocido o un diario no entran en el agregado.
- Una pregunta sobre otra ciudad orienta a la Línea 106. La línea gratuita orienta a 01 8000 931 089. Villavicencio o WhatsApp orientan a Yo Te Escucho. Cada orientación muestra el límite humano.
- Acepta id o URL pública de Spotify y de YouTube. La respuesta pública no arrastra secretos.
