import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCardComponent } from './event-card';
import { provideRouter } from '@angular/router';

describe('EventCardComponent', () => {
  let component: EventCardComponent;
  let fixture: ComponentFixture<EventCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCardComponent],
      providers: [provideRouter([])] // Proveemos el router falso porque la tarjeta usa routerLink
    }).compileComponents();

    fixture = TestBed.createComponent(EventCardComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe calcular las plazas disponibles correctamente', () => {
    // Le inyectamos datos de prueba
    component.aforoMaximo = 10;
    component.inscritos = 3;
    
    // Forzamos la detección de cambios
    fixture.detectChanges();

    // Comprobamos la lógica
    expect(component.plazasDisponibles).toBe(7);
    expect(component.estaLleno).toBe(false);
  });

  it('debe marcar el evento como lleno si los inscritos igualan el aforo máximo', () => {
    component.aforoMaximo = 14;
    component.inscritos = 14;
    
    fixture.detectChanges();

    expect(component.plazasDisponibles).toBe(0);
    expect(component.estaLleno).toBe(true);
  });

  it('debe mostrar el texto "¡Completo!" en el HTML cuando el aforo está lleno', () => {
    component.aforoMaximo = 4;
    component.inscritos = 4;
    fixture.detectChanges(); // Angular actualiza el HTML con los nuevos datos

    const compiled = fixture.nativeElement as HTMLElement;
    // Buscamos en todo el texto renderizado de la tarjeta
    expect(compiled.textContent).toContain('¡Completo!');
  });
});