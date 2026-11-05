// Script de inicialización de MongoDB. Lo ejecuta mongosh como root en el primer arranque
// del contenedor (solo cuando el volumen de datos está vacío).
// Crea el usuario de la aplicación con permisos readWrite únicamente sobre su base de datos.

const dbName = process.env.MONGO_DB_NAME;
const appUser = process.env.MONGO_APP_USER;
const appPassword = process.env.MONGO_APP_PASSWORD;

if (!dbName || !appUser || !appPassword) {
  throw new Error('Faltan MONGO_DB_NAME, MONGO_APP_USER o MONGO_APP_PASSWORD');
}

const appDb = db.getSiblingDB(dbName);

if (appDb.getUser(appUser)) {
  print(`[mongo-init] El usuario '${appUser}' ya existe en '${dbName}'; no se modifica`);
} else {
  appDb.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [{ role: 'readWrite', db: dbName }],
  });
  print(`[mongo-init] Usuario '${appUser}' creado con rol readWrite sobre '${dbName}'`);
}
