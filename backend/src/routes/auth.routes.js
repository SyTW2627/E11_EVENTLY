const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST: Endpoint de login (se accederá mediante /api/auth/login)
router.post('/login', (req, res) => {
    // Extraemos el email y la contraseña del cuerpo de la petición
    const { email, password } = req.body;

    // Validación básica para comprobar que nos llegan datos
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const payload = {
      usuario: {
        email: email,
        rol: 'user' // Por defecto asignamos rol de usuario normal
      }
    };

    // Usamos una variable de entorno para el secreto, con un respaldo temporal
    const secret = process.env.JWT_SECRET || 'secreto_temporal_evently_2026';
    
    jwt.sign(
      payload, 
      secret, 
      { expiresIn: '1h' }, // El token caducará en 1 hora
      (error, token) => {
        if (error) throw error;
          //Devolver el token al frontend
          res.status(200).json({ 
            message: 'Autenticación exitosa',
            token: token 
          });
        }
    );
});

module.exports = router;