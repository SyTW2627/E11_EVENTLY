// Instancia de la aplicación Express. No arranca el servidor: eso lo hace server.js.
const express = require('express');
const cors = require('cors')

const app = express();

// Parseo del cuerpo de las peticiones en formato JSON
app.use(express.json());
app.use(cors()); 

// Endpoint de comprobación (Health check)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API del servidor funcionando correctamente' 
  });
});

// Importar las rutas de eventos
const eventsRoutes = require('./routes/events.routes');

// Usar las rutas importadas
app.use('/api/events', eventsRoutes);

module.exports = app;
