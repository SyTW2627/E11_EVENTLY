// Carga de variables de entorno desde el .env de la raíz del repositorio.
// Debe requerirse antes que cualquier otro módulo que lea process.env.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  quiet: true,
});

module.exports = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
};
