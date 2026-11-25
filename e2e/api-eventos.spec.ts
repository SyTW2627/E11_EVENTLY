// Tests E2E de la API de eventos con el cliente de peticiones de Playwright (SCRUM-71).
import { test, expect } from './utils/fixtures';
import { API, cabeceraAuth, crearEventoPorApi, crearUsuarioAutenticado, datosEvento } from './utils/datos';

test.describe('API de eventos', () => {
  test('crear un evento deja al organizador como primer inscrito', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const datos = datosEvento();

    const respuesta = await request.post(`${API}/events`, {
      headers: cabeceraAuth(organizador.token),
      data: datos,
    });
    expect(respuesta.status()).toBe(201);
    const { evento } = await respuesta.json();
    expect(evento.titulo).toBe(datos.titulo);
    expect(evento.estado).toBe('activo');
    expect(evento.organizador).toEqual({ _id: organizador.id, nombre: organizador.nombre });
    expect(evento.inscritos).toHaveLength(1);
    expect(evento.inscritos[0].usuario._id).toBe(organizador.id);
  });

  test('el detalle solo incluye comentarios para los inscritos', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const otro = await crearUsuarioAutenticado(request, 'Visitante E2E');
    const evento = await crearEventoPorApi(request, organizador);

    const comoOrganizador = await request.get(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(organizador.token),
    });
    expect(comoOrganizador.status()).toBe(200);
    expect((await comoOrganizador.json()).evento).toHaveProperty('comentarios');

    const comoNoInscrito = await request.get(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(otro.token),
    });
    expect(comoNoInscrito.status()).toBe(200);
    const cuerpo = await comoNoInscrito.text();
    expect(JSON.parse(cuerpo).evento).not.toHaveProperty('comentarios');
    expect(cuerpo).not.toMatch(/email|passwordHash/);
  });

  test('solo el organizador puede editar el evento', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const otro = await crearUsuarioAutenticado(request, 'Intruso E2E');
    const evento = await crearEventoPorApi(request, organizador);
    const cambios = { titulo: `${evento.titulo} (editado)` };

    const ajeno = await request.put(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(otro.token),
      data: cambios,
    });
    expect(ajeno.status()).toBe(403);
    expect((await ajeno.json()).mensaje).toBe('Solo el organizador puede modificar este evento');

    const propio = await request.put(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(organizador.token),
      data: cambios,
    });
    expect(propio.status()).toBe(200);
    expect((await propio.json()).evento.titulo).toBe(cambios.titulo);
  });

  test('el organizador cancela el evento sin borrarlo', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const evento = await crearEventoPorApi(request, organizador);

    const cancelar = await request.delete(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(organizador.token),
    });
    expect(cancelar.status()).toBe(200);
    expect((await cancelar.json()).evento.estado).toBe('cancelado');

    const detalle = await request.get(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(organizador.token),
    });
    expect(detalle.status()).toBe(200);
    expect((await detalle.json()).evento.estado).toBe('cancelado');

    const otraVez = await request.delete(`${API}/events/${evento._id}`, {
      headers: cabeceraAuth(organizador.token),
    });
    expect(otraVez.status()).toBe(409);
  });
});
