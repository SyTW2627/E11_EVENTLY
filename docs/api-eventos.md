# API de eventos

Contrato de los endpoints de publicación, detalle, edición y cancelación de eventos
(SCRUM-48, SCRUM-49 y SCRUM-53). Pendiente de validar con el equipo: ver
[Diferencias con el contrato general](#diferencias-con-el-contrato-general).

## Convenciones

- Base: `/api/events`. Todas las rutas requieren la cabecera `Authorization: Bearer <token>`.
- Fechas en ISO 8601 y en UTC (por ejemplo, `2026-11-20T18:00:00Z`). MongoDB las guarda en UTC.
- Errores con la forma `{ "mensaje": "...", "detalles": { "campo": "mensaje" } }`. `detalles` solo
  aparece cuando el error afecta a campos concretos.
- Los usuarios dentro de un evento (organizador, inscritos y autores de comentarios) se devuelven
  solo con `_id` y `nombre`. Nunca se exponen el email ni el hash de la contraseña.

| Código | Cuándo |
| --- | --- |
| 400 | Datos no válidos, id con formato incorrecto o JSON mal formado |
| 401 | Sin token, o el usuario del token no existe |
| 403 | El usuario no es el organizador (edición y cancelación) |
| 404 | El evento no existe |
| 409 | Operación no permitida por el estado del evento |

## Modelo de evento

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `titulo` | String | Obligatorio, 3 a 80 caracteres |
| `descripcion` | String | Opcional, máximo 500 caracteres |
| `disciplina` | String | Obligatoria: `futbol`, `futbol-sala`, `padel`, `voley-playa`, `baloncesto` |
| `nivel` | String | `principiante`, `intermedio`, `avanzado` o `todos` (por defecto) |
| `ubicacion.instalacion` | String | Obligatoria, máximo 100 caracteres |
| `ubicacion.zona` | String | Obligatoria, máximo 60 caracteres |
| `fechaInicio` | Date | Obligatoria y futura al crear |
| `fechaFin` | Date | Obligatoria y posterior a `fechaInicio` |
| `aforoMin` | Número entero | Obligatorio, mínimo 2 |
| `aforoMax` | Número entero | Obligatorio, mayor o igual que `aforoMin` |
| `organizador` | Usuario | Lo asigna el servidor a partir del token |
| `estado` | String | `activo` (por defecto) o `cancelado`. Lo gestiona el servidor |
| `inscritos` | Lista | `{ usuario, fechaInscripcion }`, sin repetir usuario y como máximo `aforoMax` |
| `comentarios` | Lista | `{ _id, autor, texto, fecha }` |
| `plazasLibres` | Número | Calculado: `aforoMax` menos número de inscritos |
| `completo` | Booleano | Calculado: no quedan plazas libres |
| `createdAt`, `updatedAt` | Date | Automáticos |

## POST /api/events: publicar un evento

Solo se tienen en cuenta `titulo`, `descripcion`, `disciplina`, `nivel`, `ubicacion`, `fechaInicio`,
`fechaFin`, `aforoMin` y `aforoMax`. Cualquier otro campo (`organizador`, `estado`, `inscritos`,
`comentarios`...) se ignora. El organizador es el usuario del token y queda inscrito automáticamente.

Petición:

```json
{
  "titulo": "Pachanga de fútbol sala",
  "descripcion": "Partido amistoso, nivel medio",
  "disciplina": "futbol-sala",
  "nivel": "intermedio",
  "ubicacion": { "instalacion": "Pabellón de Guajara", "zona": "La Laguna" },
  "fechaInicio": "2026-11-20T18:00:00Z",
  "fechaFin": "2026-11-20T19:30:00Z",
  "aforoMin": 8,
  "aforoMax": 10
}
```

Respuesta `201`:

```json
{
  "mensaje": "Evento publicado correctamente",
  "evento": {
    "_id": "6735f0c2a1b2c3d4e5f60789",
    "titulo": "Pachanga de fútbol sala",
    "descripcion": "Partido amistoso, nivel medio",
    "disciplina": "futbol-sala",
    "nivel": "intermedio",
    "ubicacion": { "instalacion": "Pabellón de Guajara", "zona": "La Laguna" },
    "fechaInicio": "2026-11-20T18:00:00.000Z",
    "fechaFin": "2026-11-20T19:30:00.000Z",
    "aforoMin": 8,
    "aforoMax": 10,
    "organizador": { "_id": "6735ef01a1b2c3d4e5f60001", "nombre": "Carlos Hernández" },
    "estado": "activo",
    "inscritos": [
      {
        "usuario": { "_id": "6735ef01a1b2c3d4e5f60001", "nombre": "Carlos Hernández" },
        "fechaInscripcion": "2026-11-13T10:00:00.000Z"
      }
    ],
    "comentarios": [],
    "createdAt": "2026-11-13T10:00:00.000Z",
    "updatedAt": "2026-11-13T10:00:00.000Z",
    "plazasLibres": 9,
    "completo": false
  }
}
```

Respuesta `400` (errores de validación, un mensaje por campo):

```json
{
  "mensaje": "Los datos enviados no son válidos",
  "detalles": {
    "titulo": "El título debe tener al menos 3 caracteres",
    "aforoMax": "El aforo máximo debe ser mayor o igual que el aforo mínimo"
  }
}
```

## GET /api/events/:id: detalle de un evento

Respuesta `200`: `{ "evento": { ... } }` con la misma forma que al crear. El campo `comentarios`
solo se incluye si el usuario autenticado está inscrito en el evento. Si no lo está, el evento se
devuelve sin ese campo. Los eventos cancelados o ya pasados también se pueden consultar.

Errores: `400` (id con formato incorrecto) y `404` (no existe).

## PUT /api/events/:id: editar un evento

Edición parcial: solo se modifican los campos enviados, entre los mismos que al crear. En
`ubicacion` se puede enviar solo `zona` o solo `instalacion`. Solo puede editar el organizador.

Petición:

```json
{
  "titulo": "Pachanga de fútbol sala (cambio de pista)",
  "ubicacion": { "instalacion": "Pabellón Juan Ríos Tejera" }
}
```

Respuesta `200`: `{ "mensaje": "Evento actualizado correctamente", "evento": { ... } }`.

Errores:

| Código | Mensaje |
| --- | --- |
| 400 | Datos no válidos (con `detalles`), o ningún campo editable en el cuerpo |
| 403 | `Solo el organizador puede modificar este evento` |
| 409 | `No se puede editar un evento cancelado` |
| 409 | `No se puede editar un evento que ya ha terminado` |
| 409 | `El aforo máximo no puede ser menor que el número de inscritos (N)` |

## DELETE /api/events/:id: cancelar un evento

No borra el evento: lo marca como `cancelado`. Solo puede cancelarlo el organizador.

Respuesta `200`: `{ "mensaje": "Evento cancelado correctamente", "evento": { ..., "estado": "cancelado" } }`.

Errores: `403` (no es el organizador) y `409` (`El evento ya está cancelado`).

## Diferencias con el contrato general

`docs/contrato-api.md` define "Crear un Evento Deportivo" con otro formato. Hay que acordar con el
equipo cuál se mantiene:

| `contrato-api.md` | Esta API |
| --- | --- |
| `fecha` + `hora` por separado | `fechaInicio` y `fechaFin` en ISO 8601 (UTC) |
| `aforo_minimo`, `aforo_maximo` | `aforoMin`, `aforoMax` |
| `ubicacion` como texto | `ubicacion: { instalacion, zona }` |
| `disciplina` libre (`"Fútbol 7"`) | Valores fijos de `utils/constantes.js` (`futbol`, `padel`...) |
| Sin `titulo` | `titulo` obligatorio |
| Respuesta `{ mensaje, evento_id }` | Respuesta `{ mensaje, evento }` con el evento completo |

## Autenticación

Se reutiliza el middleware `verificarToken` de `routes/events.routes.js`, que deja en `req.usuario`
los datos del token (`{ email, rol }`). Como el token no incluye el id del usuario, el servicio
busca el usuario por su email. Si no existe, responde `401`.

Pendiente para el responsable de autenticación:

- Incluir el id del usuario en el token para evitar esa búsqueda.
- El login todavía no comprueba la contraseña ni que el usuario exista.
- Con un token inválido o caducado, el middleware responde `400` con `{ message }`. Lo esperado
  sería `401` con `{ mensaje }`.
