const express = require('express');
const router = express.Router();

// Ruta temporal de prueba para comprobar que el enrutador funciona
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Enrutador de eventos configurado correctamente' });
});

// GET: Obtener un evento específico por su ID
router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Detalles del evento con ID: ${req.params.id}` });
});

// POST: Crear un nuevo evento
router.post('/', (req, res) => {
    // 201 es el código HTTP correcto para "Creado"
    res.status(201).json({ message: 'Nuevo evento creado exitosamente' });
});

// PUT: Actualizar un evento existente por completo
router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Evento con ID: ${req.params.id} actualizado` });
});

// DELETE: Eliminar un evento
router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Evento con ID: ${req.params.id} eliminado` });
});


module.exports = router;