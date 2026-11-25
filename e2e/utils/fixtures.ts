// Extiende el test de Playwright con una conexión a MongoDB por worker, necesaria para crear
// los usuarios de prueba (el registro de la API todavía no guarda usuarios en la base de datos).
import { test as base, expect } from '@playwright/test';
import { conectar, desconectar } from './bd';

export const test = base.extend<object, { conexionBd: void }>({
  conexionBd: [
    async ({}, use) => {
      await conectar();
      await use();
      await desconectar();
    },
    { scope: 'worker', auto: true },
  ],
});

export { expect };
