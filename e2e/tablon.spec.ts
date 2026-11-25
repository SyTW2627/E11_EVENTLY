// Test E2E del tablón de eventos (SCRUM-71).
// El formulario de publicación todavía no envía datos a la API, así que el evento se publica por
// API y se comprueba que aparece en el tablón usando el filtro de zona de la interfaz.
import { test, expect } from './utils/fixtures';
import { crearEventoPorApi, crearUsuarioAutenticado, idEjecucion } from './utils/datos';

test('un evento publicado aparece en el tablón al filtrar por su zona', async ({ page, request }) => {
  const organizador = await crearUsuarioAutenticado(request, 'Organizador E2E');
  // Zona única para que el evento no quede fuera de la primera página por otros eventos de la base
  const zona = `Zona E2E ${idEjecucion()}`;
  const evento = await crearEventoPorApi(request, organizador, {
    ubicacion: { instalacion: 'Pabellón E2E', zona },
  });

  // Sesión iniciada: el frontend lee el token de localStorage
  await page.addInitScript((token) => localStorage.setItem('auth_token', token), organizador.token);
  await page.goto('/tablon');
  await expect(page.getByRole('heading', { name: 'Tablón de Eventos' })).toBeVisible();

  await page.getByPlaceholder('Ej. La Laguna, Santa Cruz...').fill(zona);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();

  const tarjeta = page.getByRole('heading', { name: evento.titulo });
  await expect(tarjeta).toBeVisible();
  await expect(page.getByText(`Pabellón E2E (${zona})`)).toBeVisible();
});
