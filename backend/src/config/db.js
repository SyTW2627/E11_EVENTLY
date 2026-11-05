// Conexión a MongoDB mediante Mongoose.
// Nunca se imprime la cadena de conexión ni la contraseña: solo host, base de datos y usuario.
const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGO_URI no está definida. Revisa el fichero .env de la raíz del repositorio');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.error(`[db] No se pudo conectar a MongoDB: ${err.message}`);
    throw err;
  }

  // Se pregunta al servidor con qué usuario se ha autenticado realmente la conexión
  const { host, port, name } = mongoose.connection;
  const status = await mongoose.connection.db.command({ connectionStatus: 1 });
  const [authUser] = status.authInfo.authenticatedUsers;
  const userInfo = authUser
    ? `autenticado como '${authUser.user}' (authSource '${authUser.db}')`
    : 'SIN autenticación';
  console.log(`[db] Conectado a MongoDB en ${host}:${port}, base '${name}', ${userInfo}`);

  // A partir de aquí, si se pierde la conexión o hay errores, se avisa por consola
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Conexión con MongoDB perdida');
  });
  mongoose.connection.on('error', (err) => {
    console.error(`[db] Error en la conexión con MongoDB: ${err.message}`);
  });
  return mongoose.connection;
}

module.exports = connectDB;
