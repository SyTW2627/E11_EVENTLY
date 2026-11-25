const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/auth.service');
const ErrorApi = require('../src/utils/ErrorApi');

jest.mock('../src/services/auth.service');

describe('Endpoints de Autenticación (/api/auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/ping responde con estado 200', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  test('POST /api/auth/register registra usuario y devuelve 201 con token', async () => {
    authService.registrarUsuario.mockResolvedValue({
      token: 'jwt_token_prueba',
      usuario: { _id: '123', nombre: 'Ana', email: 'ana@mail.com' },
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Ana', email: 'ana@mail.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe('jwt_token_prueba');
    expect(res.body.usuario.email).toBe('ana@mail.com');
  });

  test('POST /api/auth/register devuelve 409 si el email ya existe', async () => {
    authService.registrarUsuario.mockRejectedValue(
      new ErrorApi(409, 'Ya existe un usuario registrado con ese email')
    );

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'duplicado@mail.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.mensaje).toBe('Ya existe un usuario registrado con ese email');
  });

  test('POST /api/auth/login autentica correctamente y devuelve 200 con token', async () => {
    authService.iniciarSesion.mockResolvedValue({
      token: 'jwt_login_ok',
      usuario: { _id: '123', email: 'ana@mail.com' },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@mail.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('jwt_login_ok');
  });

  test('POST /api/auth/login devuelve 401 con credenciales incorrectas', async () => {
    authService.iniciarSesion.mockRejectedValue(new ErrorApi(401, 'Credenciales incorrectas'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@mail.com', password: 'mal' });

    expect(res.status).toBe(401);
    expect(res.body.mensaje).toBe('Credenciales incorrectas');
  });
});