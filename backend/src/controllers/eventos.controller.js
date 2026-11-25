// Controladores de eventos: traducen la petición HTTP a llamadas al servicio.
// Express 5 pasa al gestor de errores cualquier excepción de una función async.
const eventosService = require('../services/eventos.service');

// GET /api/events (SCRUM-83 y SCRUM-84)
async function listar(req, res) {
  const resultado = await eventosService.listarEventosActivos(req.query);
  res.status(200).json(resultado);
}

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

// POST /api/events/:id/inscripcion (SCRUM-72). El usuario sale del token; el cuerpo se ignora.
async function inscribirse(req, res) {
  const evento = await eventosService.inscribirseEvento(req.params.id, req.usuario);
  res.status(201).json({ mensaje: 'Inscripción realizada correctamente', evento });
}

// DELETE /api/events/:id/inscripcion (SCRUM-85 y SCRUM-86)
async function darseDeBaja(req, res) {
  const evento = await eventosService.darseDeBajaEvento(req.params.id, req.usuario);
  res.status(200).json({ mensaje: 'Baja realizada correctamente', evento });
}

module.exports = {
  listar,
  crear,
  detalle,
  editar,
  cancelar,
  inscribirse,
  darseDeBaja,
};