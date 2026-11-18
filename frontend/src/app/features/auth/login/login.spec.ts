import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login';
import { AuthService } from '../../../services/auth/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  // Variables para nuestros "espías"
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    // 1. Creamos objetos falsos que simulan ser los servicios reales
    const authSpy = { iniciarSesion: vi.fn(), setToken: vi.fn() };
    const rSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule], // El componente al ser standalone va en imports
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    // Inyectamos los espías para poder comprobar más tarde si se les llamó
    authServiceSpy = TestBed.inject(AuthService) as any;
    routerSpy = TestBed.inject(Router) as any;
    
    fixture.detectChanges();
  });

  // TEST 1: Comprobar que el componente no está roto
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Lógica de negocio (Validaciones del formulario)
  it('debe requerir un email válido y una contraseña', () => {
    const emailControl = component.loginForm.controls['email'];
    const passwordControl = component.loginForm.controls['password'];

    // Estado inicial vacío
    expect(component.loginForm.valid).toBe(false);

    // Valores inválidos
    emailControl.setValue('correo-falso'); // No tiene @
    passwordControl.setValue('');
    expect(emailControl.valid).toBe(false);

    // Valores válidos
    emailControl.setValue('yoel@ull.edu.es');
    passwordControl.setValue('123456');
    expect(component.loginForm.valid).toBe(true);
  });

  // TEST 3: Interacción con el usuario y flujos (Login exitoso)
  it('debe llamar al backend, guardar el token y navegar al tablón si los datos son correctos', () => {
    // Simulamos que el usuario rellena el formulario
    component.loginForm.controls['email'].setValue('yoel@ull.edu.es');
    component.loginForm.controls['password'].setValue('123456');

    // Le decimos a nuestro espía del backend que responda correctamente con un token
    const respuestaSimulada = { token: 'token-jwt-falso-123' };
    authServiceSpy.iniciarSesion.mockReturnValue(of(respuestaSimulada)); // 'of' crea un Observable

    // Disparamos la función
    component.onSubmit();

    // Comprobamos que el flujo hace todo lo que le pediste en el .ts
    expect(authServiceSpy.iniciarSesion).toHaveBeenCalledWith({ email: 'yoel@ull.edu.es', password: '123456' });
    expect(authServiceSpy.setToken).toHaveBeenCalledWith('token-jwt-falso-123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tablon']);
  });
});