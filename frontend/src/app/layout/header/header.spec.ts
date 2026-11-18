import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../services/auth/auth';

describe('HeaderComponent', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let routerSpy: any;

  beforeEach(async () => {
    // 1. Creamos espías para los servicios inyectados
    const rSpy = { navigate: vi.fn() };
    const authSpy = { getToken: vi.fn() }; // Aunque no se use directamente, Angular lo inyecta

    await TestBed.configureTestingModule({
      imports: [Header], // Standalone component
      providers: [
        
        { provide: AuthService, useValue: authSpy },
        provideRouter([]) // Necesario para que los routerLink del HTML no rompan el test
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as any;
    vi.spyOn(routerSpy, "navigate").mockResolvedValue(true);
  });

  // TEST 1: Creación básica
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Lógica del getter (TypeScript)
  it('debe devolver isLoggedIn = true si hay token en el localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-falso-123');
    expect(component.isLoggedIn).toBe(true);
  });

  it('debe devolver isLoggedIn = false si NO hay token en el localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    expect(component.isLoggedIn).toBe(false);
  });

  // TEST 3: Interfaz dinámica (HTML) - Estado Invitado
  it('debe mostrar "Iniciar sesión" y "Regístrate" si el usuario NO está logueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    fixture.detectChanges(); // Renderizamos el HTML con el estado falso

    const compiled = fixture.nativeElement as HTMLElement;
    
    // Verificamos que los botones de invitado existen
    expect(compiled.textContent).toContain('Iniciar sesión');
    expect(compiled.textContent).toContain('Regístrate');
    
    // Verificamos que la navegación privada NO existe
    expect(compiled.textContent).not.toContain('Perfil');
    expect(compiled.textContent).not.toContain('Salir');
  });

  // TEST 4: Interfaz dinámica (HTML) - Estado Logueado
  it('debe mostrar "Perfil", el avatar y "Salir" si el usuario SÍ está logueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-jwt-123');
    fixture.detectChanges(); 

    const compiled = fixture.nativeElement as HTMLElement;
    
    // Verificamos que los elementos privados ahora sí existen
    expect(compiled.textContent).toContain('Tablón');
    expect(compiled.textContent).toContain('Perfil');
    expect(compiled.textContent).toContain('Salir');
    expect(compiled.textContent).toContain('+ Publicar evento');
    
    // Verificamos que los botones de invitado desaparecieron
    expect(compiled.textContent).not.toContain('Iniciar sesión');
  });

  // TEST 5: Lógica de la función logout()
  it('debe borrar el token del localStorage y navegar al /login al ejecutar logout()', () => {
    // Espiamos la función removeItem del navegador
    vi.spyOn(Storage.prototype, 'removeItem');
    
    // Ejecutamos la función
    component.logout();
    
    // Comprobamos que hizo su trabajo
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('auth_token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});