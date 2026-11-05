# Grupo E11 - Plataforma de encuentros deportivos amateur

Plataforma web para organizar encuentros deportivos amateur, desarrollada con el stack MEAN (MongoDB, Express, Angular y Node.js) para la asignatura Sistemas y Tecnologías Web (ULL).

## Estructura del repositorio

```
backend/              API REST con Node.js + Express
  src/config/         Configuración (entorno y conexión a MongoDB)
  src/controllers/    Controladores
  src/middlewares/    Middlewares
  src/models/         Modelos de Mongoose
  src/routes/         Rutas
  src/services/       Lógica de negocio
  src/utils/          Utilidades
  src/app.js          Instancia de Express
  src/server.js       Arranque: conecta a la BD y escucha
frontend/             Aplicación Angular
docker/mongo-init/    Script de inicialización de MongoDB
docker-compose.yml    MongoDB local
.env.example          Plantilla de variables de entorno
```

## Requisitos

- Node.js 24 LTS (npm incluido)
- Docker y Docker Compose (Docker Desktop en macOS y Windows)

## Puesta en marcha

### 1. Variables de entorno

Hay un único `.env` en la raíz del repositorio. Lo leen tanto `docker compose` como el backend.

```bash
cp .env.example .env
```

Cambia en `.env` las contraseñas `MONGO_ROOT_PASSWORD` y `MONGO_APP_PASSWORD`, y pon la misma contraseña de aplicación en `MONGO_URI`. Por ejemplo, puedes generar contraseñas con `openssl rand -hex 24`. El fichero `.env` no se sube nunca al repositorio.

### 2. MongoDB

```bash
docker compose up -d
```

Levanta MongoDB 7, accesible solo desde `localhost:27017` y con autenticación activada. En el primer arranque, el script `docker/mongo-init/01-create-app-user.js` crea el usuario `MONGO_APP_USER` con rol `readWrite` únicamente sobre la base `MONGO_DB_NAME`. La aplicación se conecta con ese usuario, no con root.

- Ver el estado: `docker compose ps`
- Parar: `docker compose down`
- Borrar también los datos: `docker compose down -v`. Al volver a levantarlo, el script de inicialización se ejecuta de nuevo, lo que es necesario si cambias las credenciales en `.env`.

### 3. Backend

```bash
cd backend
npm install
npm run dev     # desarrollo, con recarga automática (nodemon)
npm start       # sin recarga
```

Si la conexión es correcta, el log muestra:

```
[db] Conectado a MongoDB en localhost:27017, base 'e11_encuentros', autenticado como 'e11_app' (authSource 'e11_encuentros')
[server] Servidor escuchando en el puerto 3000 (development)
```

Si MongoDB no está disponible o las credenciales son incorrectas, el backend muestra el error y termina con código 1.

## Convención de ramas y commits

Seguimos Git Flow:

- `main`: versión estable. No se hacen pushes directos: los cambios llegan solo mediante Pull Request desde `develop`, con al menos 1 aprobación.
- `develop`: rama de integración.
- `feature/<descripcion-corta>`: una rama por tarea, creada desde `develop`. Se integra en `develop` mediante Pull Request revisado por otro miembro del grupo.

Los mensajes de commit siguen [Conventional Commits](https://www.conventionalcommits.org/es/) en español, con commits pequeños y atómicos:

- `feat: añade modelo de usuario`
- `fix: corrige validación de fecha del encuentro`
- `docs: documenta arranque de MongoDB`
- `chore: actualiza dependencias`
- `refactor:`, `test:`, `style:` según corresponda
