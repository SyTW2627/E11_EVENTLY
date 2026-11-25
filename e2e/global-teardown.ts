// Se ejecuta una vez al terminar todos los tests (SCRUM-71).
// Borra SOLO los documentos marcados por la suite (emails e2e-...@example.test y títulos [E2E]),
// incluidos los que hayan quedado de ejecuciones anteriores interrumpidas.
import { conectar, desconectar, limpiarDatosE2E, contarDatosE2E } from './utils/bd';

export default async function globalTeardown(): Promise<void> {
  try {
    await conectar();
  } catch {
    // El globalSetup ya ha explicado el problema; aquí solo se avisa de que no se ha limpiado.
    console.warn('[e2e] Limpieza omitida: MongoDB no responde');
    return;
  }
  try {
    const borrados = await limpiarDatosE2E();
    const restantes = await contarDatosE2E();
    console.log(
      `[e2e] Limpieza: ${borrados.eventos} eventos y ${borrados.usuarios} usuarios de prueba borrados; ` +
        `quedan ${restantes.eventos + restantes.usuarios} documentos con marca E2E`
    );
  } finally {
    await desconectar();
  }
}
