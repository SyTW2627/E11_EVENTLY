// Punto de arranque del backend: escucha en el puerto configurado.
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Servidor escuchando en el puerto ${PORT}`);
});
