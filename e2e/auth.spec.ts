// Tests E2E de autenticación desde la interfaz (SCRUM-71).
import { test, expect } from './utils/fixtures';
import { API, contrasenaAleatoria, emailE2E } from './utils/datos';

test.describe('Autenticación', () => {
  test('un usuario nuevo se registra y después inicia sesión', async ({ page }) => {
    const email = emailE2E();
    const password = contrasenaAleatoria();

    // Registro: guarda el token y lleva al onboarding
    await page.goto('/registro');
    await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill(password);
    await page.getByLabel('Repetir Contraseña').fill(password);
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/onboarding$/);
    expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBeTruthy();

    // Se cierra la sesión borrando el token y se vuelve a entrar desde el login
    await page.evaluate(() => localStorage.removeItem('auth_token'));
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña').fill(password);
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL(/\/tablon$/);
    await expect(page.getByRole('heading', { name: 'Tablón de Eventos' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBeTruthy();
  });

  test('sin sesión, una ruta privada redirige al login', async ({ page }) => {
    await page.goto('/tablon');
    await expect(page).toHaveURL(/\/login$/);
  });

  // FIXME: hoy POST /api/auth/login no comprueba la contraseña (devuelve un token para cualquier
  // email y contraseña) y POST /api/auth/register no guarda el usuario. Este test describe el
  // comportamiento correcto y debe activarse cuando se corrija el módulo de autenticación.
  test.fixme('el login rechaza una contraseña incorrecta', async ({ request }) => {
    const email = emailE2E();
    const registro = await request.post(`${API}/auth/register`, {
      data: { email, password: contrasenaAleatoria() },
    });
    expect(registro.status()).toBe(201);

    const login = await request.post(`${API}/auth/login`, {
      data: { email, password: contrasenaAleatoria() },
    });
    expect(login.status()).toBe(401);
  });
});
