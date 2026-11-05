# Protocolo de Trabajo en Ramas (Git Flow)

## Estructura de ramas principales
  
**main**: contiene únicamente código estable y funcional (versiones de producción). Nadie programa directamente aquí.

**develop**: rama principal de integración. Todo el código nuevo se fusiona aquí para ser probado antes de pasar a main.

## Nomenclatura de ramas de trabajo
  
Cada vez que un miembro empiece una tarea de Jira, debe crear una rama desde develop siguiendo esta estructura: `<tipo>/<id-jira>-<descripcion-corta>`

Para nuevas funcionalidades: `feature/SCRUM-22-setup-angular`

Para solucionar errores: `bugfix/SCRUM-34-error-cors`

Para tareas de documentación: `docs/SCRUM-9-protocolo-ramas`

## Convención de commits
 
Los mensajes de los commits deben ser descriptivos y seguir el estándar de Conventional Commits:

**feat**: para nuevas funcionalidades (ej. feat: añadir formulario de registro).

**fix**: para corrección de errores (ej. fix: resolver fallo de validación de token).

**chore**: para mantenimiento o configuración (ej. chore: actualizar dependencias de node).

## Flujo de integración (Pull Requests)

Al terminar la tarea, el desarrollador sube su rama a GitHub y abre un Pull Request hacia la rama develop.

**Regla estricta**: ningún Pull Request puede fusionarse (merge) por su propio autor. Requiere al menos la revisión y aprobación visual de otro miembro del equipo.

Una vez aprobado, se fusiona en develop y se borra la rama de trabajo local.
