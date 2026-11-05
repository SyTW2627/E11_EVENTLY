// Punto de arranque del backend: carga el entorno, conecta a MongoDB y escucha en el puerto.
const config = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  try {
    await connectDB(config.mongoUri);
  } catch (err) {
    console.error('[server] Arranque cancelado: no hay conexión con la base de datos');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`[server] Servidor escuchando en el puerto ${config.port} (${config.nodeEnv})`);
  });
}

start();
