// Controladores de eventos: traducen la petición HTTP a llamadas al servicio.
// Express 5 pasa al gestor de errores cualquier excepción de una función async.
const eventosService = require('../services/eventos.service');

// POST /api/events
async function crear(req, res) {
  const evento = await eventosService.crearEvento(req.body, req.usuario);
  res.status(201).json({ mensaje: 'Evento publicado correctamente', evento });
}

// GET /api/events/:id
async function detalle(req, res) {
  const evento = await eventosService.obtenerDetalle(req.params.id, req.usuario);
  res.status(200).json({ evento });
}

module.exports = {
  crear,
  detalle,
};
