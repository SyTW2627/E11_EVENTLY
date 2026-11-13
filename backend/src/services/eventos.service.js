// Lógica de negocio de los eventos: publicación, detalle, edición y cancelación.
// Los errores se lanzan como ErrorApi y los traduce a respuesta el gestor de errores.
const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');
const ErrorApi = require('../utils/ErrorApi');

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

module.exports = {
  crearEvento,
  obtenerDetalle,
  editarEvento,
  cancelarEvento,
};
