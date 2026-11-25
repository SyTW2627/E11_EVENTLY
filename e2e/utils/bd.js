// Acceso a MongoDB para los tests E2E (SCRUM-71).
// Reutiliza el .env, Mongoose y los modelos del backend para no añadir dependencias.
// Los tests usan la base de desarrollo, así que todo lo que crean va marcado:
//   - usuarios con email  e2e-<idEjecución>-<sufijo>@example.test
//   - eventos con título  [E2E] ...
// La limpieza borra solo documentos con esas marcas; nunca hay borrados sin filtro.
const path = require('path');

const RAIZ = path.resolve(__dirname, '../..');
require(path.join(RAIZ, 'backend/src/config/env'));
const mongoose = require(path.join(RAIZ, 'backend/node_modules/mongoose'));
const Usuario = require(path.join(RAIZ, 'backend/src/models/Usuario'));
const Evento = require(path.join(RAIZ, 'backend/src/models/Evento'));

const PREFIJO_TITULO = '[E2E]';
const FILTRO_USUARIOS_E2E = { email: /^e2e-[a-z0-9-]+@example\.test$/ };
const FILTRO_EVENTOS_E2E = { titulo: /^\[E2E\]/ };

const MENSAJE_SIN_MONGO =
  'No se puede conectar con MongoDB. Levántalo con `docker compose up -d` desde la raíz del ' +
  'repositorio y comprueba que el fichero .env tiene MONGO_URI.';

async function conectar() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error(MENSAJE_SIN_MONGO);
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    await mongoose.connection.db.command({ ping: 1 });
  } catch {
    await mongoose.disconnect().catch(() => {});
    throw new Error(MENSAJE_SIN_MONGO);
  }
}

async function desconectar() {
  await mongoose.disconnect();
}

// Comprueba que MongoDB responde; si no, lanza un error con el mensaje claro.
async function comprobarMongo() {
  await conectar();
  await desconectar();
}

// Elimina solo los documentos marcados por los tests y devuelve cuántos ha borrado.
async function limpiarDatosE2E() {
  const eventos = await Evento.deleteMany(FILTRO_EVENTOS_E2E);
  const usuarios = await Usuario.deleteMany(FILTRO_USUARIOS_E2E);
  return { eventos: eventos.deletedCount, usuarios: usuarios.deletedCount };
}

async function contarDatosE2E() {
  const eventos = await Evento.countDocuments(FILTRO_EVENTOS_E2E);
  const usuarios = await Usuario.countDocuments(FILTRO_USUARIOS_E2E);
  return { eventos, usuarios };
}

module.exports = {
  Usuario,
  Evento,
  PREFIJO_TITULO,
  conectar,
  desconectar,
  comprobarMongo,
  limpiarDatosE2E,
  contarDatosE2E,
};

// Uso como script (lo ejecuta el webServer del backend antes de arrancarlo, porque Playwright
// levanta los servidores antes que el globalSetup):
//   node e2e/utils/bd.js comprobar   -> comprueba que MongoDB responde
//   node e2e/utils/bd.js contar      -> cuenta los documentos con marca E2E
if (require.main === module) {
  const accion = process.argv[2];
  (async () => {
    if (accion === 'comprobar') {
      await comprobarMongo();
    } else if (accion === 'contar') {
      await conectar();
      console.log('Documentos con marca E2E:', await contarDatosE2E());
      await desconectar();
    } else {
      throw new Error('Uso: node e2e/utils/bd.js comprobar|contar');
    }
  })().catch((err) => {
    console.error(`\n[e2e] ${err.message}\n`);
    process.exit(1);
  });
}
