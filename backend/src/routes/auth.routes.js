const express = require('express');
const router = express.Router();

// POST: Endpoint de login (se accederá mediante /api/auth/login)
router.post('/login', (req, res) => {
    // Extraemos el email y la contraseña del cuerpo de la petición
    const { email, password } = req.body;

    // Validación básica para comprobar que nos llegan datos
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    // Respuesta temporal de éxito
    res.status(200).json({ 
        message: 'Endpoint de login configurado correctamente',
        emailRecibido: email 
    });
});

module.exports = router;