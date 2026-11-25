const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const eventosService = require('../src/services/eventos.service');
const ErrorApi = require('../src/utils/ErrorApi');

jest.mock('../src/services/eventos.service');

const secret = process.env.JWT_SECRET || 'secreto_temporal_evently_2026';
const tokenValido = jwt.sign(
  { usuario: { id: '507f1f77bcf86cd799439011', email: 'user@mail.com', rol: 'user' } },
  secret,
  { expiresIn: '1h' }
);

describe('Endpoints de Eventos (/api/events)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/events devuelve listado paginado cuando el token es válido', async () => {
    eventosService.listarEventos.mockResolvedValue({
      eventos: [{ _id: 'ev1', titulo: 'Partido Pádel' }],
      paginacion: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    });

    const res = await request(app)
      .get('/api/events?disciplina=padel&pagina=1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.status).toBe(200);
    expect(res.body.eventos).toHaveLength(1);
    expect(eventosService.listarEventos).toHaveBeenCalledTimes(1);
  });

  test('POST /api/events crea un evento y devuelve 201', async () => {
    eventosService.crearEvento.mockResolvedValue({
      _id: 'ev2',
      titulo: 'Torneo Fútbol 7',
    });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ titulo: 'Torneo Fútbol 7', disciplina: 'futbol' });

    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Torneo Fútbol 7');
  });

  test('POST /api/events/:id/inscripcion inscribe al usuario y devuelve 200', async () => {
    eventosService.inscribirUsuario.mockResolvedValue({
      _id: 'ev1',
      participantes: ['507f1f77bcf86cd799439011'],
    });

    const res = await request(app)
      .post('/api/events/507f1f77bcf86cd799439022/inscripcion')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.status).toBe(200);
  });

  test('POST /api/events/:id/inscripcion devuelve 409 si el aforo está completo', async () => {
    eventosService.inscribirUsuario.mockRejectedValue(
      new ErrorApi(409, 'El evento ha alcanzado su aforo máximo')
    );

    const res = await request(app)
      .post('/api/events/507f1f77bcf86cd799439022/inscripcion')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.status).toBe(409);
    expect(res.body.mensaje).toBe('El evento ha alcanzado su aforo máximo');
  });
});