# Operación de la información

Oasis no confirma solo si un teléfono o una actividad siguen vigentes. Una persona lo hace, con fuente y fecha.

## Teléfonos oficiales

Quién los verifica: alguien del equipo del prototipo, contrastando el catálogo con el Directorio de salud mental y prevención del suicidio de MinSalud, o con la entidad dueña de la línea si el directorio cambia.

Cada cuánto: al inicio de cada periodo académico y cada vez que MinSalud publique una actualización. La fecha visible (`sourceDate`, hoy 19 oct 2026) se cambia en el mismo commit que el número.

Si un enlace o un teléfono no responde: la ficha tiene "Anotar que no contestó". Eso copia un aviso sin datos de una persona (línea, teléfono publicado, fuente, fecha de consulta y día de la prueba). Quien opera el prototipo envía ese aviso a la entidad dueña de la línea o lo deja en un issue del repositorio, sin pegar `.env` ni relatos personales. El número no se reemplaza en la interfaz hasta tener otra fuente y otra fecha. No hay un buzón automático que dé de baja un teléfono.

El compañero de `/hablar` usa esa misma ficha. No tiene una fuente distinta ni una fecha propia.

## Actividades

Quién publica un borrador: la sala `/sala`, pensada como el canal de un colegio o una comunidad. Hace falta `ADMIN_PASSWORD` y Postgres. El borrador entra como ejemplo.

Quién podría confirmarla: una persona verificadora de la entidad (bienestar escolar, casa de cultura o la organización que invita), con un enlace público y la fecha en que lo miró. Este formulario no tiene un botón para quitar la marca Ejemplo. Si en la base una fila trajera `sample` en falso, además harían falta `source_url` y `verified_at`; si falta alguno, la agenda la sigue mostrando como ejemplo.

Cada cuánto: la programación de ejemplo se revisa cada semana mientras el prototipo esté en uso. Una actividad cuya fecha ya pasó se deja de mostrar en esa semana; no se presenta como vigente.

Si el lugar o el enlace dejan de servir: se borra o se corrige la fila de ejemplo en Postgres, o se retira el seed del código, y se anota la fecha de la revisión. No se inventa otro lugar para "rellenar" el mapa.

## Métricas

Los conteos no identifican a nadie. No hay un procedimiento de corrección de una ficha personal porque esa ficha no existe. Si un conteo se viera raro, se reinicia la base de operaciones o se vuelve a cargar la semilla. El diario, en IndexedDB, solo lo borra la persona en su navegador.
