// Se ejecuta una vez antes de todos los tests (SCRUM-71).
// Comprueba que MongoDB responde y genera el id de esta ejecución, que marca los datos de prueba.
import { randomBytes } from 'node:crypto';
import { comprobarMongo } from './utils/bd';

export default async function globalSetup(): Promise<void> {
  await comprobarMongo();
  // Las variables de entorno fijadas aquí llegan a los workers de los tests.
  process.env.E2E_RUN_ID = randomBytes(4).toString('hex');
}
