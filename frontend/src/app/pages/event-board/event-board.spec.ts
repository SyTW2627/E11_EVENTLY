import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EventBoardComponent, RespuestaEventos } from './event-board';
import { ApiService } from '../../core/services/api';

describe('EventBoardComponent', () => {
  let component: EventBoardComponent;
  let fixture: ComponentFixture<EventBoardComponent>;
  let apiServiceMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockRespuesta: RespuestaEventos = {
    eventos: [
      {
        _id: '1',
        titulo: 'Pachanga de Jueves',
        disciplina: 'futbol',
        nivel: 'intermedio',
        ubicacion: { instalacion: 'Pabellón ULL', zona: 'La Laguna' },
        fechaInicio: '2026-11-26T18:00:00.000Z',
        fechaFin: '2026-11-26T19:00:00.000Z',
        aforoMin: 6,
        aforoMax: 14,
        estado: 'activo',
        inscritos: []
      },
      {
        _id: '2',
        titulo: 'Torneo rápido Pádel',
        disciplina: 'padel',
        nivel: 'avanzado',
        ubicacion: { instalacion: 'Cancha Las Mantecas', zona: 'La Laguna' },
        fechaInicio: '2026-11-27T10:00:00.000Z',
        fechaFin: '2026-11-27T11:30:00.000Z',
        aforoMin: 4,
        aforoMax: 4,
        estado: 'activo',
        inscritos: []
      }
    ],
    paginacion: { total: 2, pagina: 1, limite: 10, totalPaginas: 1 }
  };

  beforeEach(async () => {
    apiServiceMock = {
      get: vi.fn().mockReturnValue(of(mockRespuesta)),
      post: vi.fn(),
      delete: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [EventBoardComponent],
      providers: [{ provide: ApiService, useValue: apiServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(EventBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe enviar los filtros seleccionados como parámetros a la API al ejecutar aplicarFiltros()', () => {
    component.filtros = {
      zona: 'La Laguna',
      disciplina: 'voley-playa',
      fecha: '2026-11-26'
    };

    component.aplicarFiltros();

    expect(apiServiceMock.get).toHaveBeenCalledWith('events', {
      zona: 'La Laguna',
      disciplina: 'voley-playa',
      fecha: '2026-11-26'
    });
  });

  it('debe renderizar dinámicamente las tarjetas de eventos (app-event-card) recibidas de la API', () => {
    const tarjetasRenderizadas = fixture.nativeElement.querySelectorAll('app-event-card');
    expect(apiServiceMock.get).toHaveBeenCalledWith('events', {});
    expect(tarjetasRenderizadas.length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('debe mostrar el estado vacío si la API devuelve una lista sin eventos', () => {
    apiServiceMock.get.mockReturnValue(
      of({ eventos: [], paginacion: { total: 0, pagina: 1, limite: 10, totalPaginas: 0 } })
    );
    component.cargarEventos();
    fixture.detectChanges();

    const tarjetas = fixture.nativeElement.querySelectorAll('app-event-card');
    expect(tarjetas.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No hay eventos disponibles');
  });

  it('debe mostrar el mensaje de error si la petición a la API falla', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    apiServiceMock.get.mockReturnValue(throwError(() => new Error('Error de red')));
    component.cargarEventos();
    fixture.detectChanges();

    expect(component.errorMensaje()).toContain('No se pudieron cargar los eventos');
    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Reintentar');
    consoleSpy.mockRestore();
  });

  it('debe llamar a POST events/:id/inscripcion y actualizar el evento al inscribirse', () => {
    const eventoActualizado = {
      ...mockRespuesta.eventos[0],
      inscritos: [{ usuario: { _id: 'u1', nombre: 'Yoel' }, fechaInscripcion: '2026-11-23T20:00:00.000Z' }]
    };
    apiServiceMock.post.mockReturnValue(
      of({ mensaje: 'Inscripción realizada correctamente', evento: eventoActualizado })
    );

    component.inscribirse('1');

    expect(apiServiceMock.post).toHaveBeenCalledWith('events/1/inscripcion', {});
    expect(component.eventos()[0].inscritos.length).toBe(1);
    expect(component.eventosInscritos()['1']).toBe(true);
    expect(component.feedbackMensaje()?.tipo).toBe('exito');
  });

  it('debe llamar a DELETE events/:id/inscripcion y actualizar el evento al darse de baja', () => {
    const eventoActualizado = { ...mockRespuesta.eventos[0], inscritos: [] };
    apiServiceMock.delete.mockReturnValue(
      of({ mensaje: 'Baja realizada correctamente', evento: eventoActualizado })
    );

    component.darseDeBaja('1');

    expect(apiServiceMock.delete).toHaveBeenCalledWith('events/1/inscripcion');
    expect(component.eventos()[0].inscritos.length).toBe(0);
    expect(component.eventosInscritos()['1']).toBe(false);
    expect(component.feedbackMensaje()?.tipo).toBe('exito');
  });
});