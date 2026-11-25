// Tests E2E de la inscripción en eventos con control de aforo (SCRUM-72), vía API.
import { test, expect } from './utils/fixtures';
import { API, cabeceraAuth, crearEventoPorApi, crearUsuarioAutenticado } from './utils/datos';
import { Evento } from './utils/bd';

const urlInscripcion = (id: string) => `${API}/events/${id}/inscripcion`;

test.describe('API de inscripción', () => {
  test('un usuario se inscribe correctamente', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const jugador = await crearUsuarioAutenticado(request, 'Jugador E2E');
    const evento = await crearEventoPorApi(request, organizador);

    const respuesta = await request.post(urlInscripcion(evento._id), {
      headers: cabeceraAuth(jugador.token),
    });
    expect(respuesta.status()).toBe(201);
    const cuerpo = await respuesta.text();
    expect(cuerpo).not.toMatch(/email|passwordHash/);

    const { mensaje, evento: actualizado } = JSON.parse(cuerpo);
    expect(mensaje).toBe('Inscripción realizada correctamente');
    expect(actualizado.inscritos.map((i: { usuario: { _id: string } }) => i.usuario._id)).toContain(jugador.id);
    expect(actualizado.plazasLibres).toBe(evento.plazasLibres - 1);
    // Ya inscrito, recibe los comentarios
    expect(actualizado).toHaveProperty('comentarios');
  });

  test('inscribirse dos veces devuelve 409', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const jugador = await crearUsuarioAutenticado(request, 'Jugador E2E');
    const evento = await crearEventoPorApi(request, organizador);

    expect((await request.post(urlInscripcion(evento._id), { headers: cabeceraAuth(jugador.token) })).status()).toBe(201);
    const duplicado = await request.post(urlInscripcion(evento._id), { headers: cabeceraAuth(jugador.token) });
    expect(duplicado.status()).toBe(409);
    expect((await duplicado.json()).mensaje).toBe('Ya estás inscrito en este evento');

    // El organizador ya está inscrito desde la creación
    const organizadorDuplicado = await request.post(urlInscripcion(evento._id), {
      headers: cabeceraAuth(organizador.token),
    });
    expect(organizadorDuplicado.status()).toBe(409);
  });

  test('un evento lleno devuelve 409', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    const primero = await crearUsuarioAutenticado(request, 'Jugador E2E');
    const segundo = await crearUsuarioAutenticado(request, 'Jugador E2E');
    // Aforo 2: el organizador y un jugador lo llenan
    const evento = await crearEventoPorApi(request, organizador, { aforoMin: 2, aforoMax: 2 });

    expect((await request.post(urlInscripcion(evento._id), { headers: cabeceraAuth(primero.token) })).status()).toBe(201);
    const lleno = await request.post(urlInscripcion(evento._id), { headers: cabeceraAuth(segundo.token) });
    expect(lleno.status()).toBe(409);
    expect((await lleno.json()).mensaje).toBe('El evento está completo: no quedan plazas libres');
  });

  test('las inscripciones simultáneas nunca superan el aforo', async ({ request }) => {
    const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
    // aforoMax 4: el organizador ocupa una plaza y quedan exactamente 3 libres
    const evento = await crearEventoPorApi(request, organizador, { aforoMin: 2, aforoMax: 4 });
    const jugadores = await Promise.all(
      Array.from({ length: 10 }, () => crearUsuarioAutenticado(request, 'Jugador E2E'))
    );

    const respuestas = await Promise.all(
      jugadores.map((jugador) =>
        request.post(urlInscripcion(evento._id), { headers: cabeceraAuth(jugador.token) })
      )
    );
    const estados = respuestas.map((r) => r.status());
    expect(estados.filter((s) => s === 201)).toHaveLength(3);
    expect(estados.filter((s) => s === 409)).toHaveLength(7);

    const enBd = await Evento.findById(evento._id);
    expect(enBd?.inscritos).toHaveLength(4);
  });
});
