import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile'; // Pon './profile.component' si procede
import { ApiService } from '../../../core/services/api';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let apiSpy: any;

  beforeEach(async () => {
    // 1. Creamos el espía del ApiService para no tocar la base de datos real
    const spy = { put: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: ApiService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.inject(ApiService) as any;
    
    // Espiamos los alerts y console.log/error de forma global para este componente
    vi.spyOn(window, 'alert');
    vi.spyOn(console, 'log');
    vi.spyOn(console, 'error');
    
    fixture.detectChanges();
  });

  // TEST 1: Comprobar creación
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Validaciones complejas (Regex del Teléfono)
  it('debe validar que el teléfono tenga exactamente 9 números', () => {
    const telefonoControl = component.profileForm.controls['telefono'];

    // Caso incorrecto: letras
    telefonoControl.setValue('abc123456');
    expect(telefonoControl.valid).toBe(false);

    // Caso incorrecto: más de 9 números
    telefonoControl.setValue('1234567890');
    expect(telefonoControl.valid).toBe(false);

    // Caso correcto: exactamente 9 números
    telefonoControl.setValue('600123456');
    expect(telefonoControl.valid).toBe(true);
  });

  // TEST 3: Flujo de actualización exitoso
  it('debe hacer una petición PUT y mostrar un alert de éxito si el formulario es válido', () => {
    // Rellenamos el formulario con datos válidos
    component.profileForm.patchValue({
      nombre: 'Yoel',
      apellidos: 'Sánchez',
      telefono: '600111222',
      biografia: 'Hola soy Yoel'
    });

    // Simulamos que el backend responde con un 200 OK
    apiSpy.put.mockReturnValue(of({ success: true }));

    // Lanzamos el submit
    component.onSubmit();

    // Verificamos que se llamó a la API con los datos correctos y la URL correcta
    expect(apiSpy.put).toHaveBeenCalledWith('users/profile', {
      nombre: 'Yoel',
      apellidos: 'Sánchez',
      telefono: '600111222',
      biografia: 'Hola soy Yoel'
    });
    
    // Verificamos que se mostró el mensaje de éxito al usuario
    expect(window.alert).toHaveBeenCalledWith('Tus datos se han guardado correctamente.');
  });

  // TEST 4: Flujo de error del servidor
  it('debe mostrar un alert de error si la petición PUT falla', () => {
    component.profileForm.patchValue({ nombre: 'Yoel', apellidos: 'Sánchez' });
    
    // Simulamos que el servidor está caído o devuelve un Error 500
    apiSpy.put.mockReturnValue(throwError(() => new Error('Error de conexión')));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Hubo un error al guardar los datos.');
  });

  // TEST 5: Control de validación (Envío en blanco)
  it('debe marcar todos los campos como "touched" y no llamar a la API si el formulario es inválido', () => {
    // Dejamos el form vacío intencionadamente
    component.onSubmit();

    // La petición a la API nunca debió dispararse
    expect(apiSpy.put).not.toHaveBeenCalled();
    
    // Los campos obligatorios debieron marcarse como tocados para que el HTML enseñe el mensaje en rojo
    expect(component.profileForm.controls['nombre'].touched).toBe(true);
    expect(component.profileForm.controls['apellidos'].touched).toBe(true);
  });
});