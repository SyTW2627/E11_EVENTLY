// Ayudantes compartidos para crear datos de prueba marcados (SCRUM-71).
import { randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { Usuario, PREFIJO_TITULO } from './bd';

// Los tests de API llaman directamente al backend; los de interfaz usan el baseURL del frontend.
export const API = 'http://localhost:3000/api';

const aleatorio = (bytes = 4) => randomBytes(bytes).toString('hex');

export const idEjecucion = (): string => process.env.E2E_RUN_ID ?? 'local';

// Email marcado: e2e-<idEjecución>-<sufijo>@example.test
export const emailE2E = (): string => `e2e-${idEjecucion()}-${aleatorio()}@example.test`;

// Contraseña generada en cada ejecución; nunca se usan contraseñas fijas.
export const contrasenaAleatoria = (): string => `Pw-${randomBytes(12).toString('base64url')}`;

export const tituloE2E = (texto: string): string => `${PREFIJO_TITULO} ${texto} ${aleatorio(3)}`;

export interface UsuarioPrueba {
  id: string;
  nombre: string;
  email: string;
  password: string;
  token: string;
}

export const cabeceraAuth = (token: string) => ({ Authorization: `Bearer ${token}` });

// Crea un usuario marcado y obtiene su token con POST /api/auth/login.
// El usuario se inserta directamente en MongoDB porque /api/auth/register todavía es un registro
// simulado que no guarda nada. El passwordHash es un valor aleatorio: el login actual no lo comprueba.
export async function crearUsuarioAutenticado(
  request: APIRequestContext,
  nombre = 'Jugador E2E'
): Promise<UsuarioPrueba> {
  const email = emailE2E();
  const password = contrasenaAleatoria();
  const usuario = await Usuario.create({ nombre, email, passwordHash: aleatorio(16) });

  const respuesta = await request.post(`${API}/auth/login`, { data: { email, password } });
  expect(respuesta.ok(), 'el login de un usuario de prueba debe funcionar').toBeTruthy();
  const { token } = await respuesta.json();
  return { id: String(usuario._id), nombre, email, password, token };
}

export interface DatosEvento {
  titulo?: string;
  disciplina?: string;
  ubicacion?: { instalacion: string; zona: string };
  fechaInicio?: string;
  fechaFin?: string;
  aforoMin?: number;
  aforoMax?: number;
}

// Datos válidos de un evento futuro con el título marcado.
export function datosEvento(cambios: DatosEvento = {}): Required<DatosEvento> {
  const manana = Date.now() + 24 * 60 * 60 * 1000;
  return {
    titulo: tituloE2E('Pachanga'),
    disciplina: 'futbol-sala',
    ubicacion: { instalacion: 'Pabellón E2E', zona: 'La Laguna' },
    fechaInicio: new Date(manana).toISOString(),
    fechaFin: new Date(manana + 90 * 60 * 1000).toISOString(),
    aforoMin: 2,
    aforoMax: 10,
    ...cambios,
  };
}

// Publica un evento con POST /api/events y devuelve el evento de la respuesta.
export async function crearEventoPorApi(
  request: APIRequestContext,
  organizador: UsuarioPrueba,
  cambios: DatosEvento = {}
) {
  const respuesta = await request.post(`${API}/events`, {
    headers: cabeceraAuth(organizador.token),
    data: datosEvento(cambios),
  });
  expect(respuesta.status(), 'la publicación del evento de prueba debe devolver 201').toBe(201);
  return (await respuesta.json()).evento;
}
