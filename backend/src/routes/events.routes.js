const express = require('express');
const router = express.Router();

// Ruta temporal de prueba para comprobar que el enrutador funciona
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Enrutador de eventos configurado correctamente' });
});

module.exports = router;