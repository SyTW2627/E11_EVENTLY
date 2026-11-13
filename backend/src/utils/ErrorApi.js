// Error de la API con código de estado HTTP. Lo lanzan los servicios y lo traduce a
// respuesta el gestor de errores (middlewares/gestorErrores.js) con la forma
// { mensaje, detalles? }.
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
    this.detalles = detalles;
  }
}

module.exports = ErrorApi;
