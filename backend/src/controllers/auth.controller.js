// Controladores de autenticación: traducen peticiones HTTP a llamadas al servicio.
const authService = require('../services/auth.service');

// POST /api/auth/register (SCRUM-68)
async function register(req, res) {
  const { token, usuario } = await authService.registrarUsuario(req.body);
  res.status(201).json({
    mensaje: 'Usuario registrado correctamente',
    message: 'Usuario registrado correctamente',
    token,
    usuario,
  });
}

// POST /api/auth/login (SCRUM-68)
async function login(req, res) {
  const { token, usuario } = await authService.iniciarSesion(req.body);
  res.status(200).json({
    mensaje: 'Autenticación exitosa',
    message: 'Autenticación exitosa',
    token,
    usuario,
  });
}

module.exports = {
  register,
  login,
};