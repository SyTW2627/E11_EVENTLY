import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Módulo vital para simular el backend
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Verificamos que no queden peticiones HTTP colgadas en el aire después de cada test
  afterEach(() => {
    httpMock.verify();
  });

  // TEST 1: Creación del servicio
  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // TEST 2: Petición HTTP - Registro
  it('debe enviar un POST al endpoint de registro con los datos del usuario', () => {
    const mockUsuario = { email: 'yoel@ull.edu.es', password: '123' };
    const mockRespuesta = { success: true };

    // Nos suscribimos a la función
    service.registrarUsuario(mockUsuario).subscribe(res => {
      expect(res).toEqual(mockRespuesta);
    });

    // Atrapamos la petición que Angular intenta sacar hacia Node.js
    const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
    
    // Verificamos que usa el método POST y envía el cuerpo correcto
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUsuario);
    
    // Devolvemos los datos simulados
    req.flush(mockRespuesta);
  });

  // TEST 3: Petición HTTP - Login
  it('debe enviar un POST al endpoint de login con las credenciales', () => {
    const mockCredenciales = { email: 'yoel@ull.edu.es', password: '123' };
    const mockRespuesta = { token: 'jwt-12345' };

    service.iniciarSesion(mockCredenciales).subscribe(res => {
      expect(res).toEqual(mockRespuesta);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredenciales);
    
    req.flush(mockRespuesta);
  });

  // TEST 4: Gestión del LocalStorage - Guardar
  it('debe guardar el token en el localStorage (setToken)', () => {
    vi.spyOn(Storage.prototype, 'setItem');
    
    service.setToken('mi-token-seguro');
    
    // Verificamos que usó la clave 'auth_token' que definiste en tu .ts
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('auth_token', 'mi-token-seguro');
  });

  // TEST 5: Gestión del LocalStorage - Leer
  it('debe recuperar el token del localStorage (getToken)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-guardado');
    
    const tokenDevuelto = service.getToken();
    
    expect(Storage.prototype.getItem).toHaveBeenCalledWith('auth_token');
    expect(tokenDevuelto).toBe('token-guardado');
  });

  // TEST 6: Gestión del LocalStorage - Borrar
  it('debe eliminar el token del localStorage al hacer logout()', () => {
    vi.spyOn(Storage.prototype, 'removeItem');
    
    service.logout();
    
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('auth_token');
  });
});