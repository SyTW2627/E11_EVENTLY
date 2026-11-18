import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../../services/auth/auth';

describe('AuthInterceptor', () => {
  let authServiceSpy: any;

  beforeEach(() => {
    // 1. Preparamos el espía del servicio
    const authSpy = { getToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as any;
  });

  // TEST 1: El usuario está logueado (inyecta el token)
  it('debe añadir la cabecera Authorization con el token si existe', () => {
    // Simulamos que tenemos un token en el localStorage
    authServiceSpy.getToken.mockReturnValue('token-jwt-12345');

    // Creamos una petición GET de mentira
    const requestFalsa = new HttpRequest('GET', '/api/eventos');
    
    // Creamos un espía para la función 'next' que simplemente devuelve un observable vacío
    const nextSpy = vi.fn().mockReturnValue(of(null));

    // Ejecutamos el interceptor
    TestBed.runInInjectionContext(() => {
      authInterceptor(requestFalsa, nextSpy);
    });

    // Capturamos la petición modificada que el interceptor le pasó al 'next'
    const requestModificada = nextSpy.mock.lastCall![0] as HttpRequest<any>;

    // Verificamos que se haya añadido la cabecera exacta
    expect(requestModificada.headers.has('Authorization')).toBe(true);
    expect(requestModificada.headers.get('Authorization')).toBe('Bearer token-jwt-12345');
  });

  // TEST 2: Usuario invitado (petición limpia)
  it('debe dejar la petición intacta si no hay token', () => {
    // Simulamos que el usuario no está logueado
    authServiceSpy.getToken.mockReturnValue(null);

    const requestFalsa = new HttpRequest('GET', '/api/eventos');
    const nextSpy = vi.fn().mockReturnValue(of(null));

    TestBed.runInInjectionContext(() => {
      authInterceptor(requestFalsa, nextSpy);
    });

    const requestModificada = nextSpy.mock.lastCall![0] as HttpRequest<any>;

    // Verificamos que NO tenga la cabecera de seguridad
    expect(requestModificada.headers.has('Authorization')).toBe(false);
  });
});