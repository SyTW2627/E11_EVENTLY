// Punto de arranque del backend: carga el entorno y escucha en el puerto configurado.
const config = require('./config/env');
const app = require('./app');

app.listen(config.port, () => {
  console.log(`[server] Servidor escuchando en el puerto ${config.port} (${config.nodeEnv})`);
});
