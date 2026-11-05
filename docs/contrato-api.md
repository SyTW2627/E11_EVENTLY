## Login de Usuario

**Petición (Angular envía a Node)**:

```JSON
{
  "email": "nombre@email.com",
  "password": "MiPassword123"
}
```

**Respuesta (Node devuelve a Angular)**: 

```JSON
{
  "mensaje": "Autenticación exitosa",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "60d5ec",
    "nombre": "Carlos Hernández"
  }
}
```

## Crear un Evento Deportivo

**Petición (Angular envía a Node)**:

```JSON
{
  "disciplina": "Fútbol 7",
  "ubicacion": "Campus de Guajara",
  "fecha": "2026-11-20",
  "hora": "18:00",
  "aforo_minimo": 8,
  "aforo_maximo": 14
}
```

**Respuesta (Node devuelve a Angular)**: 

```JSON
{
  "mensaje": "Evento publicado correctamente",
  "evento_id": "89f2ab"
}
```

## Registro de Usuario (Sign Up)

**Petición (Angular envía a Node)**:

```JSON
{
  "nombre": "Carlos Hernández",
  "email": "nombre@email.com",
  "password": "MiPassword123",
  "disciplinas_favoritas": ["Fútbol", "Pádel"],
  "nivel": "Intermedio"
}
```

**Respuesta (Node devuelve a Angular)**: 

```JSON
{
  "mensaje": "Usuario creado con éxito",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Cargar el Tablón de Eventos (Descubrimiento)

**Petición (Filtros opcionales)**:

```JSON
{
  "zona": "La Laguna",
  "solo_plazas_libres": true
}
```

**Respuesta (Devuelve un array de eventos)**: 

```JSON
[
  {
    "evento_id": "89f2ab",
    "disciplina": "Fútbol 7",
    "fecha": "2026-11-20",
    "hora": "18:00",
    "plazas_libres": 4
  }
]
```

## Inscribirse a un Evento

**Petición**:

(Solo se envía ID del evento, la identidad ya va segura en el token JWT oculto en la cabecera)

```JSON
{
  "evento_id": "89f2ab"
}
```

**Respuesta**:

```JSON
{
  "mensaje": "Inscripción confirmada",
  "plazas_restantes": 3
}
```