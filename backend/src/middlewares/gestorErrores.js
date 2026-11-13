// Gestor de errores común de la API. Debe montarse después de todas las rutas.
// Todas las respuestas de error tienen la forma { mensaje, detalles? }, donde detalles
// es un objeto { campo: mensaje } cuando el error afecta a campos concretos.
const mongoose = require('mongoose');
const ErrorApi = require('../utils/ErrorApi');

// Traduce los errores de validación de Mongoose a un mensaje en español por campo.
function detallesValidacion(err) {
  const detalles = {};
  for (const [campo, error] of Object.entries(err.errors)) {
    detalles[campo] =
      error.name === 'CastError' ? `El valor de '${campo}' no tiene un formato válido` : error.message;
  }
  return detalles;
}

// Express reconoce el gestor de errores porque recibe cuatro argumentos (next no se usa).
function gestorErrores(err, req, res, next) {
  if (err instanceof ErrorApi) {
    const cuerpo = { mensaje: err.message };
    if (err.detalles) cuerpo.detalles = err.detalles;
    return res.status(err.status).json(cuerpo);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      mensaje: 'Los datos enviados no son válidos',
      detalles: detallesValidacion(err),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      mensaje: `El valor de '${err.path}' no tiene un formato válido`,
    });
  }

  // Cuerpo JSON mal formado (lo detecta express.json)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }

  console.error('[api] Error no controlado:', err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = gestorErrores;
