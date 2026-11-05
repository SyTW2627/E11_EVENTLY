// Instancia de la aplicación Express. No arranca el servidor: eso lo hace server.js.
const express = require('express');

const app = express();

// Parseo del cuerpo de las peticiones en formato JSON
app.use(express.json());

module.exports = app;
