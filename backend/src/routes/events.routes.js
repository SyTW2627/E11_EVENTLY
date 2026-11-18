const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');

// 1. Middleware de Autenticación: El guardián de las rutas
const verificarToken = (req, res, next) => {
    // Buscamos el token en la cabecera de la petición
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Se requiere token de autenticación.' });
    }

    try {
        // Limpiamos el token por si el frontend lo envía como "Bearer <token>"
        const tokenLimpio = token.replace('Bearer ', '');
        const secret = process.env.JWT_SECRET || 'secreto_temporal_evently_2026';
        
        // Verificamos si la firma es válida y no ha caducado
        const payload = jwt.verify(tokenLimpio, secret);
        
        // Guardamos los datos del usuario en la request y dejamos pasar a la ruta
        req.usuario = payload.usuario;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token inválido o expirado.' });
    }
};

// 2. Endpoints protegidos (Usamos 'verificarToken' como filtro intermedio)

// GET: Obtener eventos activos con paginación y filtros (SCRUM-83 y SCRUM-84)
router.get('/', verificarToken, eventosController.listar);

// GET: Detalle de un evento (SCRUM-49)
router.get('/:id', verificarToken, eventosController.detalle);

// POST: Publicar un nuevo evento (SCRUM-53)
router.post('/', verificarToken, eventosController.crear);

// PUT: Edición parcial de un evento por su organizador (SCRUM-49)
router.put('/:id', verificarToken, eventosController.editar);

// DELETE: Cancelar un evento; no se borra, se marca como cancelado (SCRUM-49)
router.delete('/:id', verificarToken, eventosController.cancelar);

// POST: Inscribirse en un evento (SCRUM-85 y SCRUM-86)
router.post('/:id/inscripcion', verificarToken, eventosController.inscribirse);

// DELETE: Darse de baja de un evento (SCRUM-85 y SCRUM-86)
router.delete('/:id/inscripcion', verificarToken, eventosController.darseDeBaja);

module.exports = router;