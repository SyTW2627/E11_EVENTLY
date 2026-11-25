// Lógica de negocio de autenticación: registro e inicio de sesión contra MongoDB.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const ErrorApi = require('../utils/ErrorApi');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

function generarToken(usuario) {
  const payload = {
    usuario: {
      id: usuario._id,
      email: usuario.email,
      rol: 'user',
    },
  };

  const secret = process.env.JWT_SECRET || 'secreto_temporal_evently_2026';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// SCRUM-68: registra un nuevo usuario en MongoDB con contraseña hasheada.
async function registrarUsuario(cuerpo = {}) {
  const { nombre, email, password, nivel, preferencias } = cuerpo;

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new ErrorApi(400, 'Los datos enviados no son válidos', {
      password: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    });
  }

  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (emailNormalizado) {
    const existente = await Usuario.findOne({ email: emailNormalizado });
    if (existente) {
      throw new ErrorApi(409, 'Ya existe un usuario registrado con ese email');
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Si el frontend envía solo email y password sin nombre, generamos un nombre válido a partir del email
  const nombreFinal =
    typeof nombre === 'string' && nombre.trim().length >= 2
      ? nombre.trim()
      : emailNormalizado.split('@')[0]?.slice(0, 50) || 'Usuario';

  const nuevoUsuario = await Usuario.create({
    nombre: nombreFinal,
    email: emailNormalizado,
    passwordHash,
    ...(nivel !== undefined ? { nivel } : {}),
    ...(preferencias !== undefined ? { preferencias } : {}),
  });

  const token = generarToken(nuevoUsuario);

  return {
    token,
    usuario: nuevoUsuario.toJSON(),
  };
}

// SCRUM-68: autentica un usuario existente comparando el hash de la contraseña.
async function iniciarSesion(cuerpo = {}) {
  const { email, password } = cuerpo;

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw new ErrorApi(400, 'Email y contraseña son obligatorios');
  }

  const emailNormalizado = email.trim().toLowerCase();
  const usuario = await Usuario.findOne({ email: emailNormalizado }).select('+passwordHash');

  if (!usuario) {
    throw new ErrorApi(401, 'Credenciales incorrectas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    throw new ErrorApi(401, 'Credenciales incorrectas');
  }

  const token = generarToken(usuario);

  return {
    token,
    usuario: usuario.toJSON(),
  };
}

module.exports = {
  registrarUsuario,
  iniciarSesion,
};