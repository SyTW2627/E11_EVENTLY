const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const gestorErrores = require('../src/middlewares/gestorErrores');
const ErrorApi = require('../src/utils/ErrorApi');

// App aislada para probar gestorErrores con cada tipo de excepción
function crearAppErrores() {
  const app = express();
  app.use(express.json());

  app.get('/error-api', (req, res, next) => {
    next(new ErrorApi(409, 'Conflicto de negocio', { campo: 'duplicado' }));
  });

  app.get('/error-validacion', (req, res, next) => {
    const err = new mongoose.Error.ValidationError();
    err.addError('email', new mongoose.Error.ValidatorError({ message: 'Email inválido' }));
    next(err);
  });

  app.get('/error-cast', (req, res, next) => {
    next(new mongoose.Error.CastError('ObjectId', 'id-malo', 'id'));
  });

  app.post('/error-json', (req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/error-generico', (req, res, next) => {
    next(new Error('Fallo inesperado'));
  });

  app.use(gestorErrores);
  return app;
}

describe('Middlewares: gestorErrores', () => {
  const app = crearAppErrores();

  test('formatea correctamente un ErrorApi con status y detalles', async () => {
    const res = await request(app).get('/error-api');
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      mensaje: 'Conflicto de negocio',
      detalles: { campo: 'duplicado' },
    });
  });

  test('traduce ValidationError de Mongoose a HTTP 400 con detalles por campo', async () => {
    const res = await request(app).get('/error-validacion');
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBe('Los datos enviados no son válidos');
    expect(res.body.detalles).toHaveProperty('email', 'Email inválido');
  });

  test('traduce CastError de Mongoose a HTTP 400', async () => {
    const res = await request(app).get('/error-cast');
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toContain("'id'");
  });

  test('captura JSON mal formado con HTTP 400', async () => {
    const res = await request(app)
      .post('/error-json')
      .set('Content-Type', 'application/json')
      .send('{"json_roto": ');
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBe('El cuerpo de la petición no es un JSON válido');
  });

  test('oculta errores internos no controlados devolviendo HTTP 500', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/error-generico');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ mensaje: 'Error interno del servidor' });
    spy.mockRestore();
  });
});

describe('Middlewares: verificarToken (protección de rutas)', () => {
  const mainApp = require('../src/app');
  const secret = process.env.JWT_SECRET || 'secreto_temporal_evently_2026';

  test('devuelve 401 si no se envía cabecera Authorization', async () => {
    const res = await request(mainApp).get('/api/events');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('devuelve 400 si el token JWT es inválido o manipulado', async () => {
    const res = await request(mainApp)
      .get('/api/events')
      .set('Authorization', 'Bearer token_falso_invalido');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/inválido|expirado/i);
  });

  test('devuelve 400 si el token JWT está caducado', async () => {
    const tokenExpirado = jwt.sign({ usuario: { email: 'test@mail.com' } }, secret, {
      expiresIn: '-10s',
    });
    const res = await request(mainApp)
      .get('/api/events')
      .set('Authorization', `Bearer ${tokenExpirado}`);
    expect(res.status).toBe(400);
  });
});