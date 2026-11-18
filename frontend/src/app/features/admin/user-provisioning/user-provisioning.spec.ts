import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProvisioningComponent } from './user-provisioning';

describe('UserProvisioningComponent', () => {
  let component: UserProvisioningComponent;
  let fixture: ComponentFixture<UserProvisioningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProvisioningComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserProvisioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TEST 1: Creación del componente
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Renderizado de la lista
  it('debe renderizar el número correcto de filas de usuarios', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Buscamos todas las filas dentro del cuerpo de la tabla
    const filas = compiled.querySelectorAll('tbody tr');
    
    // Debería haber tantas filas como usuarios en el array
    expect(filas.length).toBe(component.usuarios.length);
  });

  // TEST 3: Interacción del usuario (Alerta)
  it('debe llamar a gestionarUsuario al hacer clic en el botón de gestionar', () => {
    // Espiamos la función gestionarUsuario del componente
    vi.spyOn(component, 'gestionarUsuario');
    // Espiamos el window.alert para que no salga el popup molesto durante el test
    vi.spyOn(window, 'alert');

    const compiled = fixture.nativeElement as HTMLElement;
    // Seleccionamos el primer botón de gestionar
    const botonGestionar = compiled.querySelector('tbody tr:first-child button') as HTMLButtonElement;
    
    // Simulamos el clic
    botonGestionar.click();

    // Verificamos que la función se llamó con el nombre del primer usuario ('Carlos Rivero')
    expect(component.gestionarUsuario).toHaveBeenCalledWith('Carlos Rivero');
  });

  // TEST 4: Estado vacío (Control de flujo de la vista)
  it('debe mostrar el estado vacío si no hay usuarios', () => {
    // Simulamos que la base de datos devuelve un array vacío
    component.usuarios = [];
    fixture.detectChanges(); // Forzamos a Angular a actualizar el HTML

    const compiled = fixture.nativeElement as HTMLElement;
    
    // Verificamos que el mensaje de "No hay usuarios" esté presente
    expect(compiled.textContent).toContain('No hay usuarios registrados en el sistema');
  });
});