// Lógica de negocio de los eventos: listado, publicación, detalle, edición, cancelación e inscripciones.
// Los errores se lanzan como ErrorApi y los traduce a respuesta el gestor de errores.
const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
const ErrorApi = require('../utils/ErrorApi');
const { DISCIPLINAS } = require('../utils/constantes');

// Campos que el cliente puede enviar al crear o editar un evento. Cualquier otro
// (organizador, estado, inscritos, comentarios...) se ignora.
const CAMPOS_EDITABLES = [
  'titulo',
  'descripcion',
  'disciplina',
  'nivel',
  'ubicacion',
  'fechaInicio',
  'fechaFin',
  'aforoMin',
  'aforoMax',
];
const CAMPOS_UBICACION = ['instalacion', 'zona'];

// Datos públicos de un usuario que se muestran dentro de un evento.
const CAMPOS_USUARIO_PUBLICOS = 'nombre';

const esObjetoPlano = (valor) =>
  valor !== null && typeof valor === 'object' && !Array.isArray(valor);

// Escapa caracteres especiales para usar un texto de forma segura en una RegExp (SCRUM-84)
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Devuelve solo los campos permitidos presentes en el cuerpo de la petición.
function filtrarCampos(cuerpo) {
  const datos = {};
  if (!esObjetoPlano(cuerpo)) return datos;

  for (const campo of CAMPOS_EDITABLES) {
    if (!Object.hasOwn(cuerpo, campo)) continue;

    if (campo === 'ubicacion') {
      // Mongoose ignoraría en silencio una ubicación que no sea objeto al editar
      if (!esObjetoPlano(cuerpo.ubicacion)) {
        throw new ErrorApi(400, 'Los datos enviados no son válidos', {
          ubicacion: 'La ubicación debe ser un objeto con instalacion y zona',
        });
      }
      const ubicacion = {};
      for (const subcampo of CAMPOS_UBICACION) {
        if (Object.hasOwn(cuerpo.ubicacion, subcampo)) ubicacion[subcampo] = cuerpo.ubicacion[subcampo];
      }
      datos.ubicacion = ubicacion;
    } else {
      datos[campo] = cuerpo[campo];
    }
  }
  return datos;
}

// El middleware de autenticación deja en req.usuario los datos del token ({ email, rol }),
// sin el id. Se busca el usuario en la base de datos por su email para obtener el id.
async function obtenerUsuarioAutenticado(datosToken) {
  const email = datosToken && typeof datosToken.email === 'string' ? datosToken.email.trim().toLowerCase() : '';
  if (!email) {
    throw new ErrorApi(401, 'El token no identifica a ningún usuario');
  }

  const usuario = await Usuario.findOne({ email }).select('_id nombre');
  if (!usuario) {
    throw new ErrorApi(401, 'El usuario del token no existe');
  }
  return usuario;
}

// Comprueba el formato del id y devuelve el evento, o lanza 400/404.
async function buscarEvento(id) {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ErrorApi(400, 'El id del evento no tiene un formato válido');
  }

  const evento = await Evento.findById(id);
  if (!evento) {
    throw new ErrorApi(404, 'El evento no existe');
  }
  return evento;
}

const esMismoUsuario = (a, b) => String(a) === String(b);

// Prepara un evento para la respuesta: organizador, inscritos y autores de comentarios
// solo con id y nombre, y comentarios únicamente si el usuario está inscrito.
async function formatearEvento(evento, idUsuario) {
  await evento.populate([
    { path: 'organizador', select: CAMPOS_USUARIO_PUBLICOS },
    { path: 'inscritos.usuario', select: CAMPOS_USUARIO_PUBLICOS },
    { path: 'comentarios.autor', select: CAMPOS_USUARIO_PUBLICOS },
  ]);

  const json = evento.toJSON();
  const estaInscrito = json.inscritos.some(
    (inscrito) => inscrito.usuario && esMismoUsuario(inscrito.usuario._id, idUsuario)
  );
  if (!estaInscrito) {
    delete json.comentarios;
  }
  return json;
}

// SCRUM-83 y SCRUM-84: listado de eventos activos con paginación y filtros (disciplina, zona, fecha).
async function listarEventosActivos({ page = 1, limit = 10, disciplina, zona, fecha } = {}) {
  const pagina = Math.max(1, parseInt(page, 10) || 1);
  const limite = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pagina - 1) * limite;

  const filtro = { estado: 'activo' };

  // SCRUM-84: filtro por disciplina
  if (typeof disciplina === 'string' && disciplina.trim() !== '') {
    const disciplinaLimpia = disciplina.trim().toLowerCase();
    if (!DISCIPLINAS.includes(disciplinaLimpia)) {
      throw new ErrorApi(400, 'Los datos enviados no son válidos', {
        disciplina: `La disciplina '${disciplina}' no es válida. Valores permitidos: ${DISCIPLINAS.join(', ')}`,
      });
    }
    filtro.disciplina = disciplinaLimpia;
  }

  // SCRUM-84: filtro por zona (búsqueda parcial sin distinguir mayúsculas)
  if (typeof zona === 'string' && zona.trim() !== '') {
    filtro['ubicacion.zona'] = new RegExp(escaparRegex(zona.trim()), 'i');
  }

  // SCRUM-84: filtro por fecha (formato YYYY-MM-DD, cubre todo el día en UTC)
  if (typeof fecha === 'string' && fecha.trim() !== '') {
    const fechaLimpia = fecha.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia)) {
      throw new ErrorApi(400, 'Los datos enviados no son válidos', {
        fecha: 'La fecha debe tener el formato YYYY-MM-DD (ejemplo: 2026-11-20)',
      });
    }

    const inicioDia = new Date(`${fechaLimpia}T00:00:00.000Z`);
    const finDia = new Date(`${fechaLimpia}T23:59:59.999Z`);
    if (Number.isNaN(inicioDia.getTime())) {
      throw new ErrorApi(400, 'Los datos enviados no son válidos', {
        fecha: 'La fecha proporcionada no es válida',
      });
    }

    filtro.fechaInicio = { $gte: inicioDia, $lte: finDia };
  }

  const [eventos, total] = await Promise.all([
    Evento.find(filtro)
      .select('-comentarios')
      .populate('organizador', CAMPOS_USUARIO_PUBLICOS)
      .populate('inscritos.usuario', CAMPOS_USUARIO_PUBLICOS)
      .sort({ fechaInicio: 1 })
      .skip(skip)
      .limit(limite),
    Evento.countDocuments(filtro),
  ]);

  return {
    eventos,
    paginacion: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

// SCRUM-53: publica un evento nuevo. El organizador sale del token y queda inscrito.
async function crearEvento(cuerpo, datosToken) {
  const usuario = await obtenerUsuarioAutenticado(datosToken);
  const datos = filtrarCampos(cuerpo);

  const evento = await Evento.create({
    ...datos,
    organizador: usuario._id,
    inscritos: [{ usuario: usuario._id }],
  });

  return formatearEvento(evento, usuario._id);
}

// SCRUM-49: detalle de un evento.
async function obtenerDetalle(id, datosToken) {
  const usuario = await obtenerUsuarioAutenticado(datosToken);
  const evento = await buscarEvento(id);
  return formatearEvento(evento, usuario._id);
}

// Solo el organizador puede modificar o cancelar su evento.
function comprobarOrganizador(evento, usuario) {
  if (!esMismoUsuario(evento.organizador, usuario._id)) {
    throw new ErrorApi(403, 'Solo el organizador puede modificar este evento');
  }
}

// SCRUM-49: edición parcial de un evento por su organizador.
async function editarEvento(id, cuerpo, datosToken) {
  const usuario = await obtenerUsuarioAutenticado(datosToken);
  const evento = await buscarEvento(id);
  comprobarOrganizador(evento, usuario);

  if (evento.estado === 'cancelado') {
    throw new ErrorApi(409, 'No se puede editar un evento cancelado');
  }
  if (evento.fechaFin.getTime() <= Date.now()) {
    throw new ErrorApi(409, 'No se puede editar un evento que ya ha terminado');
  }

  const datos = filtrarCampos(cuerpo);
  if (Object.keys(datos).length === 0) {
    throw new ErrorApi(400, `No se ha enviado ningún campo editable. Campos permitidos: ${CAMPOS_EDITABLES.join(', ')}`);
  }

  // La ubicación se actualiza por subcampos para permitir cambiar solo la zona o la instalación
  const { ubicacion, ...resto } = datos;
  evento.set(resto);
  if (ubicacion) {
    for (const [subcampo, valor] of Object.entries(ubicacion)) {
      evento.set(`ubicacion.${subcampo}`, valor);
    }
  }

  if (typeof evento.aforoMax === 'number' && evento.aforoMax < evento.inscritos.length) {
    throw new ErrorApi(
      409,
      `El aforo máximo no puede ser menor que el número de inscritos (${evento.inscritos.length})`
    );
  }

  await evento.save();
  return formatearEvento(evento, usuario._id);
}

// SCRUM-49: cancelación de un evento por su organizador. No se borra: se marca como cancelado.
async function cancelarEvento(id, datosToken) {
  const usuario = await obtenerUsuarioAutenticado(datosToken);
  const evento = await buscarEvento(id);
  comprobarOrganizador(evento, usuario);

  if (evento.estado === 'cancelado') {
    throw new ErrorApi(409, 'El evento ya está cancelado');
  }

  evento.estado = 'cancelado';
  // Solo se valida el estado para no bloquear la cancelación por datos antiguos
  await evento.save({ validateModifiedOnly: true });
  return formatearEvento(evento, usuario._id);
}

// SCRUM-72: inscripción de un usuario a un evento con control de aforo atómico.
// Todas las condiciones (evento activo, no terminado, usuario no inscrito y plazas libres)
// se comprueban en el filtro de una única operación findOneAndUpdate, de modo que dos
// peticiones simultáneas nunca pueden superar aforoMax ni inscribir dos veces al mismo usuario.
async function inscribirseEvento(id, datosToken) {
  const usuario = await obtenerUsuarioAutenticado(datosToken);
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ErrorApi(400, 'El id del evento no tiene un formato válido');
  }

  const ahora = new Date();
  const evento = await Evento.findOneAndUpdate(
    {
      _id: id,
      estado: 'activo',
      fechaFin: { $gt: ahora },
      'inscritos.usuario': { $ne: usuario._id },
      $expr: { $lt: [{ $size: '$inscritos' }, '$aforoMax'] },
    },
    { $push: { inscritos: { usuario: usuario._id, fechaInscripcion: ahora } } },
    { returnDocument: 'after' }
  );

  if (evento) {
    return formatearEvento(evento, usuario._id);
  }

  // No se ha inscrito: se vuelve a leer el evento solo para saber qué error responder.
  const actual = await buscarEvento(id);
  if (actual.estado === 'cancelado') {
    throw new ErrorApi(409, 'No te puedes inscribir en un evento cancelado');
  }
  if (actual.fechaFin.getTime() <= ahora.getTime()) {
    throw new ErrorApi(409, 'No te puedes inscribir en un evento que ya ha terminado');
  }
  if (actual.inscritos.some((inscrito) => esMismoUsuario(inscrito.usuario, usuario._id))) {
    throw new ErrorApi(409, 'Ya estás inscrito en este evento');
  }
  if (actual.inscritos.length >= actual.aforoMax) {
    throw new ErrorApi(409, 'El evento está completo: no quedan plazas libres');
  }
  // El evento cambió entre la actualización y la lectura (por ejemplo, alguien se dio de baja).
  throw new ErrorApi(409, 'No se ha podido completar la inscripción; inténtalo de nuevo');
}

// SCRUM-85 y SCRUM-86: baja de un usuario de un evento.
async function darseDeBajaEvento(id, datosToken) {
  const usuario = await obtenerUsuarioAutenticado(datosToken);
  const evento = await buscarEvento(id);

  // SCRUM-86: validaciones de estado y fechas
  if (evento.estado === 'cancelado') {
    throw new ErrorApi(409, 'No puedes darte de baja de un evento cancelado');
  }
  if (evento.fechaFin.getTime() <= Date.now()) {
    throw new ErrorApi(409, 'No puedes darte de baja de un evento que ya ha terminado');
  }

  // SCRUM-86: el organizador no puede darse de baja (debe cancelar el evento)
  if (esMismoUsuario(evento.organizador, usuario._id)) {
    throw new ErrorApi(409, 'El organizador no puede darse de baja de su propio evento; debe cancelarlo');
  }

  // SCRUM-86: comprobar que el usuario realmente está inscrito
  const indice = evento.inscritos.findIndex((inscrito) =>
    esMismoUsuario(inscrito.usuario, usuario._id)
  );
  if (indice === -1) {
    throw new ErrorApi(409, 'No estás inscrito en este evento');
  }

  evento.inscritos.splice(indice, 1);
  await evento.save({ validateModifiedOnly: true });

  return formatearEvento(evento, usuario._id);
}

module.exports = {
  listarEventosActivos,
  crearEvento,
  obtenerDetalle,
  editarEvento,
  cancelarEvento,
  inscribirseEvento,
  darseDeBajaEvento,
};