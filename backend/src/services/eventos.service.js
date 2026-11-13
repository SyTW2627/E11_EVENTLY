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

    if (campo === 'ubicacion' && esObjetoPlano(cuerpo.ubicacion)) {
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

module.exports = {
  crearEvento,
};
