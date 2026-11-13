// Controladores de eventos: traducen la petición HTTP a llamadas al servicio.
// Express 5 pasa al gestor de errores cualquier excepción de una función async.
const eventosService = require('../services/eventos.service');

// POST /api/events
async function crear(req, res) {
  const evento = await eventosService.crearEvento(req.body, req.usuario);
  res.status(201).json({ mensaje: 'Evento publicado correctamente', evento });
}

module.exports = {
  crear,
};
