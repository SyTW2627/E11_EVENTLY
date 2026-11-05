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

// Importar las rutas 
const eventsRoutes = require('./routes/events.routes');
const authRoutes = require('./routes/auth.routes'); 

// Usar las rutas importadas
app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);

// Importar las rutass
const eventsRoutes = require('./routes/events.routes');

// Usar las rutas importadas (Todo lo que vaya a /api/events lo gestionará events.routes.js)
app.use('/api/events', eventsRoutes);

module.exports = app;
