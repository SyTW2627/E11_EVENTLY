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

// PUT /api/events/:id
async function editar(req, res) {
  const evento = await eventosService.editarEvento(req.params.id, req.body, req.usuario);
  res.status(200).json({ mensaje: 'Evento actualizado correctamente', evento });
}

// DELETE /api/events/:id (cancela el evento, no lo borra)
async function cancelar(req, res) {
  const evento = await eventosService.cancelarEvento(req.params.id, req.usuario);
  res.status(200).json({ mensaje: 'Evento cancelado correctamente', evento });
}

module.exports = {
  crear,
  detalle,
  editar,
  cancelar,
};
