import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EventBoardComponent } from './event-board';

describe('EventBoardComponent', () => {
  let component: EventBoardComponent;
  let fixture: ComponentFixture<EventBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventBoardComponent],
      // Proveemos el router falso porque las tarjetas hijas lo necesitan para compilar
      providers: [provideRouter([])] 
    }).compileComponents();

    fixture = TestBed.createComponent(EventBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TEST 1: Comprobar que no revienta
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Lógica del TypeScript
  it('debe hacer un console.log con los filtros al ejecutar aplicarFiltros()', () => {
    // Espiamos la consola para no ensuciar la terminal
    vi.spyOn(console, 'log');

    // Simulamos que el usuario rellenó los filtros en el código
    component.filtros = {
      texto: 'Fútbol',
      deporte: 'futbol',
      fecha: '2026-11-20'
    };

    // Ejecutamos la función
    component.aplicarFiltros();

    // Comprobamos que leyó el objeto correctamente
    expect(console.log).toHaveBeenCalledWith('Filtros aplicados:', {
      texto: 'Fútbol',
      deporte: 'futbol',
      fecha: '2026-11-20'
    });
  });

  // TEST 3: Interfaz dinámica (Renderizado de hijos)
  it('debe renderizar las tarjetas de eventos (app-event-card) en el HTML', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Buscamos cuántas etiquetas <app-event-card> se han renderizado en el grid
    const tarjetasRenderizadas = compiled.querySelectorAll('app-event-card');
    
    // Según tu HTML estático actual, hay 3 eventos hardcodeados
    expect(tarjetasRenderizadas.length).toBe(3);
  });
});