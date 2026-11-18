import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegistroComponent } from './registro';
import { AuthService } from '../services/auth/auth';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let authSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    // 1. Creamos los espías de los servicios
    const aSpy = { registrarUsuario: vi.fn(), setToken: vi.fn() };
    const rSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegistroComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: aSpy },
        
        provideRouter([]) // Para que funcione el routerLink="/login" del HTML
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    
    authSpy = TestBed.inject(AuthService) as any;
    routerSpy = TestBed.inject(Router) as any;
    vi.spyOn(routerSpy, "navigate").mockResolvedValue(true);
    
    // Espiamos alerts para que no bloqueen Karma
    vi.spyOn(window, 'alert');
    
    fixture.detectChanges();
  });

  // TEST 1: Creación estructural
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Lógica del Validador Personalizado
  it('debe invalidar el formulario si las contraseñas no coinciden (mismatch)', () => {
    // Rellenamos el email bien
    component.registroForm.controls['email'].setValue('yoel@ull.edu.es');
    
    // Ponemos contraseñas distintas
    component.registroForm.controls['password'].setValue('secreto123');
    component.registroForm.controls['confirmPassword'].setValue('secreto456');

    // El formulario debe ser inválido
    expect(component.registroForm.valid).toBe(false);
    
    // El error 'mismatch' de nuestro validador debe estar activo a nivel de formulario
    expect(component.registroForm.hasError('mismatch')).toBe(true);
  });

  // TEST 3: Lógica del Validador Personalizado (Camino feliz)
  it('debe validar el formulario si los datos son correctos y las contraseñas coinciden', () => {
    component.registroForm.controls['email'].setValue('yoel@ull.edu.es');
    component.registroForm.controls['password'].setValue('secreto123');
    component.registroForm.controls['confirmPassword'].setValue('secreto123');

    expect(component.registroForm.valid).toBe(true);
    expect(component.registroForm.hasError('mismatch')).toBe(false);
  });

  // TEST 4: Limpieza de datos antes del envío
  it('debe llamar al backend enviando solo email y password (sin confirmPassword) y navegar al onboarding', () => {
    // Preparamos datos válidos
    component.registroForm.controls['email'].setValue('yoel@ull.edu.es');
    component.registroForm.controls['password'].setValue('secreto123');
    component.registroForm.controls['confirmPassword'].setValue('secreto123');

    // Simulamos respuesta del backend con un token
    const respuestaMock = { success: true, token: 'token-nuevo-123' };
    authSpy.registrarUsuario.mockReturnValue(of(respuestaMock));

    component.onSubmit();

    // Verificamos el desestructurado: que NO se envía el confirmPassword al servidor
    expect(authSpy.registrarUsuario).toHaveBeenCalledWith({
      email: 'yoel@ull.edu.es',
      password: 'secreto123'
    });

    // Verificamos el flujo posterior al registro
    expect(authSpy.setToken).toHaveBeenCalledWith('token-nuevo-123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/onboarding']);
  });

  // TEST 5: Control de errores
  it('debe mostrar un alert si el registro falla', () => {
    // Forzamos datos válidos
    component.registroForm.controls['email'].setValue('test@test.com');
    component.registroForm.controls['password'].setValue('123456');
    component.registroForm.controls['confirmPassword'].setValue('123456');

    // Simulamos que el backend rechaza el registro (ej. email ya existe)
    authSpy.registrarUsuario.mockReturnValue(throwError(() => new Error('Email duplicado')));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Hubo un error al registrarse. Revisa la consola.');
  });
});