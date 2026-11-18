import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../../services/auth/auth';

describe('AuthGuard', () => {
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(() => {
    // 1. Creamos los espías
    const authSpy = { getToken: vi.fn() };
    const rSpy = { navigate: vi.fn() };

    // 2. Configuramos el entorno de pruebas
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    // 3. Inyectamos los espías para controlarlos en los tests
    authServiceSpy = TestBed.inject(AuthService) as any;
    routerSpy = TestBed.inject(Router) as any;
  });

  // TEST 1: El camino feliz (hay token)
  it('debe permitir el acceso (retornar true) si el usuario tiene token', () => {
    // Simulamos que el servicio sí devuelve un token válido
    authServiceSpy.getToken.mockReturnValue('token-valido-123');

    // Ejecutamos el guard dentro del contexto de inyección de Angular
    const resultado = TestBed.runInInjectionContext(() => {
      // Pasamos objetos vacíos fingiendo ser las rutas
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(resultado).toBe(true);
    // Verificamos que NO haya intentado echarnos al login
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  // TEST 2: El camino bloqueado (no hay token)
  it('debe denegar el acceso (retornar false) y redirigir al /login si no hay token', () => {
    // Simulamos que no hay token (null o vacío)
    authServiceSpy.getToken.mockReturnValue(null);

    const resultado = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(resultado).toBe(false);
    // Verificamos que SÍ haya ejecutado la expulsión hacia la pantalla de inicio de sesión
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});